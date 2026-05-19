import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are "The Mechanic Guy", a friendly, plain-spoken automotive assistant inside the VehicleHub Parts MS customer dashboard.

ABOUT YOU
- Persona: a seasoned, no-nonsense workshop mechanic. Warm, practical, blue-collar tone. Use simple language, short sentences, and the occasional shop analogy. Never condescending.
- Greeting style: "Hey there!" or "Alright, let's take a look." Avoid corporate phrasing.
- When the user uses the platform, address them as a customer, not as staff or admin.

WHAT YOU HELP WITH
1. Vehicle questions: maintenance schedules, warning lights, fluids, tires, brakes, batteries, OBD-II symptoms, fuel economy, seasonal prep, common fault diagnosis, when to DIY vs. visit a shop.
2. VehicleHub platform/system questions: how to use the customer dashboard and the flows below.

CUSTOMER PLATFORM FLOWS (use these to answer "how do I…" questions)
- My Vehicles (/customer/vehicles): add, edit, or remove vehicles. Each vehicle stores plate number, make, model, year, color, and registration details.
- Appointments (/customer/appointments): book a service appointment for one of your vehicles, pick a date/time and describe the issue. Track status (Pending, Confirmed, Completed, Cancelled). You can cancel a pending appointment.
- Part Requests (/customer/requests): request a specific part for a vehicle when you cannot find it in stock. Staff will respond with availability and pricing.
- Reviews (/customer/reviews): after an appointment is Completed you can leave a star rating and feedback.
- Profile (/customer/profile): update contact info, address, and password.
- Dashboard (/customer/dashboard): overview of upcoming appointments, vehicles, recent part requests, and reviews.
- Email reminders: the shop may send automated reminders (e.g. unpaid invoices, upcoming service) to the email on your profile.

GROUND RULES
- Stay in scope. If asked about unrelated topics (politics, coding help, etc.), politely steer back: "I'm just the mechanic around here — best I stick to cars and the VehicleHub dashboard."
- Safety first. For anything involving brakes, airbags, structural damage, electrical fires, or warning lights you can't identify, recommend visiting the shop and booking an appointment via the Appointments page.
- Do not invent prices, part availability, appointment slots, or invoice details. If the user asks about specific stock, prices, their booking, or their invoice, tell them to check the relevant page (Part Requests, Appointments, Profile) since you don't have live access to their account data.
- Never claim to take actions on the user's behalf (you can't book, cancel, pay, or order parts). Instead, walk them through where to click.
- Keep replies focused. 2-6 short paragraphs max, or a tight numbered list when giving steps. No walls of text.
- Don't ask for personal info beyond what's needed to answer the question. Never request passwords or payment details.
- If unsure, say so honestly and suggest contacting the shop.

FORMATTING
- Use markdown. Bold key terms. Use \`-\` bullets and numbered lists for steps. Avoid emojis unless the user uses one first.
- Don't start every reply with a greeting after the first message.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function pickString(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    return v
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (part && typeof part.text === "string") return part.text;
        if (part && typeof part.content === "string") return part.content;
        return "";
      })
      .join("");
  }
  return "";
}

function stripReasoningTags(text: string): string {
  // Some reasoning models inline <think>...</think> blocks before the answer.
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// Some reasoning models (e.g. nemotron-*-reasoning) dump their raw chain-of-thought
// into `content` instead of producing a clean answer. Detect telltale planning prose
// so we don't render it to the user.
function looksLikeReasoningLeakage(text: string): boolean {
  if (!text) return false;
  const head = text.slice(0, 400).toLowerCase();
  const planners = [
    "we need to respond",
    "we must respond",
    "we should respond",
    "let's craft",
    "let me craft",
    "let me think",
    "the user is asking",
    "the user says",
    "according to rules",
    "according to the rules",
    "okay, the user",
    "ok, the user",
    "as the mechanic guy",
  ];
  const hits = planners.filter((p) => head.includes(p)).length;
  // Two or more planner-phrases near the top is a strong signal it's CoT, not an answer.
  return hits >= 2;
}

const MAX_HISTORY = 20;
const MAX_USER_MESSAGE_CHARS = 4000;

export async function POST(req: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token || token === "undefined") {
    return NextResponse.json(
      { success: false, message: "You must be signed in to chat with the mechanic." },
      { status: 401 },
    );
  }

  const apiKey = process.env.OPENROUTER_KEY;
  // Default to a non-reasoning instruct model. Reasoning models (e.g. nemotron-*-reasoning,
  // deepseek-r1) frequently leak their chain-of-thought into `content` and produce unusable
  // output for a chatbot UI.
  const model = process.env.OPENROUTER_LLM_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

  if (!apiKey) {
    return NextResponse.json(
      { success: false, message: "Chatbot is not configured. Missing OPENROUTER_KEY." },
      { status: 503 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const sanitized: ChatMessage[] = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, MAX_USER_MESSAGE_CHARS),
    }))
    .slice(-MAX_HISTORY);

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== "user") {
    return NextResponse.json(
      { success: false, message: "Last message must be from the user." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_API_URL || "https://vehiclehub.local",
        "X-Title": "VehicleHub Mechanic Chatbot",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 2048,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...sanitized],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("OpenRouter error", upstream.status, errText);
      return NextResponse.json(
        {
          success: false,
          message: `Chat upstream error (${upstream.status}). Please try again.`,
        },
        { status: 502 },
      );
    }

    const data = await upstream.json();
    const choice = data?.choices?.[0];
    const message = choice?.message ?? {};

    // `content` is the answer. `reasoning`/`reasoning_content` are chain-of-thought
    // (internal planning) — do NOT fall back to them, since rendering CoT looks broken.
    const rawContent: string =
      pickString(message.content) || pickString(choice?.text) || "";

    const reply = stripReasoningTags(rawContent).trim();

    if (!reply) {
      console.warn(
        "Mechanic chat: empty reply from upstream. finish_reason=",
        choice?.finish_reason,
        "keys=",
        Object.keys(message),
        "sample=",
        JSON.stringify(message).slice(0, 500),
      );
      return NextResponse.json(
        {
          success: false,
          message: `The mechanic had nothing to say (finish_reason: ${choice?.finish_reason ?? "unknown"}). Try a different OPENROUTER_LLM_MODEL — a non-reasoning instruct model like meta-llama/llama-3.3-70b-instruct:free works best.`,
        },
        { status: 502 },
      );
    }

    if (looksLikeReasoningLeakage(reply)) {
      console.warn(
        "Mechanic chat: chain-of-thought leakage detected. model=",
        model,
        "sample=",
        reply.slice(0, 300),
      );
      return NextResponse.json(
        {
          success: false,
          message:
            "The selected model returned its internal reasoning instead of an answer. Set OPENROUTER_LLM_MODEL in .env to a non-reasoning instruct model (e.g. meta-llama/llama-3.3-70b-instruct:free) and try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { role: "assistant", content: reply, model },
    });
  } catch (err: any) {
    console.error("Mechanic chat failed", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to reach the chat service." },
      { status: 500 },
    );
  }
}
