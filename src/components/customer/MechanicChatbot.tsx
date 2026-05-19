"use client";

import React, { useEffect, useRef, useState } from "react";
import { Wrench, MessageCircle, X, Send, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/store/AuthContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hey there! I'm **The Mechanic Guy** — your in-app workshop buddy. Ask me anything about your car, or how to use VehicleHub (booking appointments, requesting parts, leaving a review, all that).",
};

const SUGGESTIONS = [
  "How do I book an appointment?",
  "My check-engine light just came on — what should I do?",
  "How often should I change my engine oil?",
  "Where do I request a hard-to-find part?",
];

export default function MechanicChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!user || user.role !== "Customer") return null;

  const sendMessage = async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || sending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/mechanic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        const msg = payload?.message || `Chat request failed (${res.status})`;
        toast.error(msg);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Sorry — I couldn't reach my radio. (${msg}) Try again in a moment.`,
          },
        ]);
        return;
      }

      const reply: string = payload.data?.content ?? "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err: any) {
      toast.error(err?.message || "Chat failed");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry — something went wrong on my end. Mind trying again?",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([GREETING]);
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Mechanic Guy chatbot"
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 pl-3 pr-5 py-3 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl shadow-orange-600/40 transition-all hover:scale-105 active:scale-95"
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="hidden sm:flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase tracking-wider opacity-80">Need help?</span>
            <span className="text-sm font-bold">Ask The Mechanic</span>
          </div>
          <MessageCircle className="w-4 h-4 opacity-80" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,400px)] h-[min(80vh,640px)] flex flex-col rounded-3xl border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#0F0F0F] shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-base">The Mechanic Guy</div>
                <div className="text-[11px] opacity-90 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Online — usually replies in seconds
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50 dark:bg-[#0A0A0A]"
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}

            {sending && (
              <div className="flex items-start gap-2">
                <Avatar />
                <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white dark:bg-[#141414] border border-zinc-200 dark:border-[#222] text-zinc-500 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mechanic is typing…
                </div>
              </div>
            )}

            {messages.length <= 1 && !sending && (
              <div className="pt-2 space-y-2">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 px-1">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414] text-zinc-700 dark:text-zinc-200 hover:border-orange-300 hover:text-orange-600 dark:hover:border-orange-500/40 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-zinc-200 dark:border-[#222] p-3 bg-white dark:bg-[#0F0F0F]">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your car or how to use the app…"
                rows={1}
                disabled={sending}
                className="flex-1 resize-none max-h-32 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-[#222] bg-zinc-50 dark:bg-[#141414] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:opacity-60"
              />
              <button
                onClick={() => sendMessage()}
                disabled={sending || !input.trim()}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 text-center">
              The Mechanic Guy is an AI assistant. For account-specific details, check the relevant page.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Avatar() {
  return (
    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow">
      <Wrench className="w-3.5 h-3.5" />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && <Avatar />}
      <div
        className={`max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap break-words rounded-2xl shadow-sm ${
          isUser
            ? "bg-orange-600 text-white rounded-tr-sm"
            : "bg-white dark:bg-[#141414] text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-[#222] rounded-tl-sm"
        }`}
      >
        {renderInlineMarkdown(message.content)}
      </div>
    </div>
  );
}

// Minimal safe inline markdown: **bold** and `code`. No HTML allowed.
function renderInlineMarkdown(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2] != null) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {match[2]}
        </strong>,
      );
    } else if (match[3] != null) {
      nodes.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[12px]"
        >
          {match[3]}
        </code>,
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}
