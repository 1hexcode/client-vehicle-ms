"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Wrench,
  ShoppingBag,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { FormInput, FormTextarea, FormSelect } from "@/components/ui/FormElements";

const contactSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .optional()
    .or(z.literal("")),
  topic: z.string().min(1, "Please choose a topic"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const TOPICS = [
  { value: "general", label: "General Inquiry" },
  { value: "parts", label: "Part / Inventory Question" },
  { value: "appointment", label: "Service Appointment" },
  { value: "support", label: "Account / Login Help" },
  { value: "partnership", label: "Vendor / Partnership" },
  { value: "other", label: "Something Else" },
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "general" },
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitting(true);
    try {
      // TODO: wire to a real backend endpoint once available
      // (e.g. POST /api/contact { fullName, email, phone, topic, subject, message }).
      // For now this simulates a successful submission.
      await new Promise((r) => setTimeout(r, 900));
      toast.success("Thanks! Your message is in the queue — we'll be in touch within 1 business day.");
      reset({ topic: "general", fullName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message || "Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#222]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#F97316]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">Contact</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-outfit">
            Talk to <span className="text-[#F97316]">VehicleHub</span>
          </h1>
          <p className="text-gray-400 mt-3 max-w-2xl text-base md:text-lg">
            Got a question about a part, your order, or a service appointment? Drop us a line —
            our team gets back to most messages within one business day.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Quick contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <InfoCard
            icon={Phone}
            label="Phone"
            primary="+977 01-5555678"
            secondary="Mon–Sat, 08:00 – 19:00"
            href="tel:+97715555678"
          />
          <InfoCard
            icon={Mail}
            label="Email"
            primary="support@vehiclehub.com"
            secondary="Replies within 1 business day"
            href="mailto:support@vehiclehub.com"
          />
          <InfoCard
            icon={MapPin}
            label="Workshop"
            primary="Kathmandu, Nepal"
            secondary="Bagmati Province"
          />
          <InfoCard
            icon={Clock}
            label="Hours"
            primary="Mon–Sat"
            secondary="08:00 – 19:00 NPT"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl shadow-black/20"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Send us a message</h2>
                <p className="text-xs text-gray-500">
                  Fill in the form below and we'll get back to you at the email you provide.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                required
                placeholder="e.g. Rina Shrestha"
                registration={register("fullName")}
                error={errors.fullName?.message}
              />
              <FormInput
                label="Email"
                required
                type="email"
                placeholder="you@example.com"
                registration={register("email")}
                error={errors.email?.message}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Phone"
                placeholder="+977 98xxxxxxxx"
                registration={register("phone")}
                error={errors.phone?.message}
              />
              <FormSelect
                label="Topic"
                required
                placeholder="Select a topic"
                options={TOPICS}
                registration={register("topic")}
                error={errors.topic?.message}
              />
            </div>

            <FormInput
              label="Subject"
              required
              placeholder="e.g. Need brake pads for a 2018 Hyundai i20"
              registration={register("subject")}
              error={errors.subject?.message}
            />

            <FormTextarea
              label="Message"
              required
              rows={6}
              placeholder="Give us a few details — part name, vehicle, urgency, anything else useful."
              registration={register("message")}
              error={errors.message?.message}
            />

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-[11px] text-gray-500 max-w-xs">
                By submitting you agree to be contacted about your inquiry. We never share your details.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Side rail */}
          <aside className="space-y-4">
            <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-4">
                Looking for something specific?
              </h3>
              <ul className="space-y-3">
                <ShortcutLink
                  href="/products"
                  icon={ShoppingBag}
                  title="Browse parts catalogue"
                  description="Search by category, vehicle type, or price."
                />
                <ShortcutLink
                  href="/customer/appointments"
                  icon={Wrench}
                  title="Book a service appointment"
                  description="Schedule a workshop visit for your vehicle."
                />
                <ShortcutLink
                  href="/customer/requests"
                  icon={HelpCircle}
                  title="Request a hard-to-find part"
                  description="Tell us what you need; we'll source it."
                />
              </ul>
            </div>

            <div className="bg-gradient-to-br from-[#F97316]/15 to-[#F97316]/5 border border-[#F97316]/30 rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/20 text-[#F97316] flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Already a customer?</h3>
              <p className="text-sm text-gray-300 mt-1">
                Sign in and ask <span className="text-[#F97316] font-semibold">The Mechanic Guy</span> —
                our in-dashboard AI assistant — quick questions about your car or how to use the app.
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-semibold transition-colors"
              >
                Sign in to chat
              </Link>
            </div>
          </aside>
        </div>

        {/* Map */}
        <div className="mt-12">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#F97316]" /> Find our workshop
          </h3>
          <div className="rounded-2xl overflow-hidden border border-[#222] bg-[#0F0F0F]">
            <iframe
              title="VehicleHub workshop location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=85.2911%2C27.6710%2C85.3611%2C27.7372&layer=mapnik&marker=27.7172%2C85.324"
              className="w-full h-[360px] grayscale-[40%]"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  label,
  primary,
  secondary,
  href,
}: {
  icon: any;
  label: string;
  primary: string;
  secondary: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-5 hover:border-[#F97316]/40 hover:bg-[#141414] transition-all duration-300 h-full">
      <div className="w-11 h-11 rounded-xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-white">{primary}</p>
      <p className="text-xs text-gray-500 mt-1">{secondary}</p>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}

function ShortcutLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex gap-3 p-3 rounded-xl bg-[#141414] border border-[#222] hover:border-[#F97316]/40 hover:bg-[#1A1A1A] transition-all"
      >
        <div className="w-9 h-9 rounded-lg bg-[#F97316]/10 text-[#F97316] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </Link>
    </li>
  );
}

