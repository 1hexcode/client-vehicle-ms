"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed successfully! Check your inbox.");
    setEmail("");
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="bg-[#F97316] rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold font-outfit text-white">Subscribe to our Newsletter</h3>
          <p className="text-white/70 text-sm">Get the latest deals and product updates delivered to your inbox.</p>
        </div>
        <form onSubmit={handleSubscribe} className="flex w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="flex-1 md:w-80 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 px-5 py-3.5 rounded-l-xl text-sm focus:outline-none focus:border-white/50 transition-colors"
          />
          <button type="submit" className="bg-black hover:bg-zinc-900 text-white px-6 py-3.5 rounded-r-xl font-bold text-sm transition-colors flex items-center gap-2">
            <Send size={16} /> Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
