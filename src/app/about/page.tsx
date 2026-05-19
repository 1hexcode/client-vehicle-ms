import Link from "next/link";
import {
  Wrench,
  ShoppingBag,
  Calendar,
  ShieldCheck,
  Sparkles,
  Heart,
  Award,
  Target,
  Rocket,
  Users,
  Package,
  Clock,
  ChevronRight,
  Building2,
  Leaf,
  HeartHandshake,
} from "lucide-react";

export const metadata = {
  title: "About Us | VehicleHub",
  description:
    "VehicleHub is a Kathmandu-based vehicle parts marketplace and workshop management platform. Learn about our mission, what we do, and the people who keep your vehicle running.",
};

const STATS = [
  { label: "Years in business", value: "12+", icon: Award },
  { label: "Parts catalogued", value: "8,500+", icon: Package },
  { label: "Happy customers", value: "20K+", icon: Users },
  { label: "Mechanics on staff", value: "30+", icon: Wrench },
];

const SERVICES = [
  {
    icon: ShoppingBag,
    title: "Parts Marketplace",
    body:
      "Browse 8,500+ genuine and aftermarket parts across cars, bikes, and commercial vehicles — filterable by category, vehicle type, price, and availability.",
    href: "/products",
    cta: "Shop parts",
  },
  {
    icon: Calendar,
    title: "Workshop Appointments",
    body:
      "Book a service slot online for any of your vehicles. Track status from Pending to Completed, and review your mechanic afterwards.",
    href: "/customer/appointments",
    cta: "Book appointment",
  },
  {
    icon: Package,
    title: "Part Requests",
    body:
      "Can't find what you need? Submit a part request with your vehicle details and our team will source it for you — often within 48 hours.",
    href: "/customer/requests",
    cta: "Request a part",
  },
  {
    icon: ShieldCheck,
    title: "Trusted by Fleets",
    body:
      "We service taxi cooperatives, delivery fleets, and rental businesses across the Kathmandu valley with bulk pricing and priority appointments.",
    href: "/contact",
    cta: "Talk to us",
  },
];

const VALUES = [
  {
    icon: Award,
    title: "Quality first",
    body:
      "Every part on our shelves is vetted by our master mechanics. We don't sell what we wouldn't put on our own vehicles.",
  },
  {
    icon: Clock,
    title: "On-time, every time",
    body:
      "Workshop slots are real slots — not rough windows. We respect your day and aim to finish faster than estimated.",
  },
  {
    icon: HeartHandshake,
    title: "Fair pricing",
    body:
      "Transparent invoices, no surprise fees, and a loyalty program that genuinely rewards repeat customers.",
  },
  {
    icon: Leaf,
    title: "Sustainable practice",
    body:
      "We recycle batteries, oil, and worn parts responsibly, and prioritise vendors who do the same.",
  },
];

const MILESTONES = [
  { year: "2013", text: "Opened our first workshop in Kathmandu with a 3-person crew and a phone for orders." },
  { year: "2016", text: "Expanded to a full parts inventory system and partnered with our first wholesale vendors." },
  { year: "2019", text: "Launched bulk service contracts with two of the valley's largest taxi cooperatives." },
  { year: "2023", text: "Went digital — built the VehicleHub platform so customers can browse, book, and request from anywhere." },
  { year: "2026", text: "Added in-app AI assistance and a customer loyalty rewards program." },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#222]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/15 via-transparent to-transparent" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-[#F97316]/10 blur-3xl rounded-full" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-xs text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#F97316]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">About</span>
          </div>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F97316]/15 border border-[#F97316]/30 text-[#F97316] text-xs font-semibold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Since 2013
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-outfit leading-tight">
              Keeping <span className="text-[#F97316]">Kathmandu</span> on the road —
              one part at a time.
            </h1>
            <p className="text-gray-400 mt-5 text-base md:text-lg leading-relaxed">
              VehicleHub started as a small workshop in 2013. Over a decade later we run one of
              Nepal's largest vehicle parts catalogues and a service network trusted by everyday
              drivers, taxi cooperatives, and fleet operators alike. We built this platform to
              make the boring parts of vehicle ownership — finding parts, booking service,
              tracking history — actually easy.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Browse the catalogue
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#141414] border border-[#222] hover:border-[#F97316]/40 text-white font-semibold transition-colors"
              >
                Talk to us <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold tabular-nums">{s.value}</p>
                    <p className="text-xs text-gray-500 leading-tight">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-7 md:p-8 hover:border-[#F97316]/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Our mission</h2>
            <p className="text-gray-400 leading-relaxed">
              Make vehicle maintenance honest, fast, and affordable for everyone in the valley — from
              the daily commuter on a 100cc bike to fleet managers running 50 cars. No upselling, no
              guesswork, no time wasted hunting for the right part.
            </p>
          </div>
          <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-7 md:p-8 hover:border-[#F97316]/30 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Where we're headed</h2>
            <p className="text-gray-400 leading-relaxed">
              By 2027, we want VehicleHub to be the default platform Nepali drivers and shops use to
              source parts and schedule service. We're investing in AI-powered diagnostics, supply
              chain partnerships across South Asia, and the in-app tools that make us as
              transparent as a good mechanic friend.
            </p>
          </div>
        </div>
      </section>

      {/* What we do */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#F97316] font-bold mb-2">
              What we do
            </p>
            <h2 className="text-3xl font-bold">Everything for your vehicle, in one place</h2>
          </div>
          <Link
            href="/products"
            className="text-sm text-gray-400 hover:text-[#F97316] inline-flex items-center gap-1"
          >
            See the full catalogue <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <article
                key={s.title}
                className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-6 hover:border-[#F97316]/30 hover:bg-[#141414] transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{s.body}</p>
                <Link
                  href={s.href}
                  className="mt-4 inline-flex items-center gap-1 text-sm text-[#F97316] hover:text-[#FB923C] font-semibold"
                >
                  {s.cta} <ChevronRight className="w-4 h-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-[#222] bg-[#0C0C0C]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-[10px] uppercase tracking-widest text-[#F97316] font-bold mb-2">
              Our values
            </p>
            <h2 className="text-3xl font-bold mb-3">What we won't compromise on</h2>
            <p className="text-gray-400">
              Four things shape every decision we make — from which vendors we work with to how we
              greet you at the workshop door.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="bg-[#0F0F0F] border border-[#222] rounded-2xl p-6 hover:border-[#F97316]/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-3xl mb-10">
          <p className="text-[10px] uppercase tracking-widest text-[#F97316] font-bold mb-2">
            The journey
          </p>
          <h2 className="text-3xl font-bold mb-3">From one workshop to the whole valley</h2>
          <p className="text-gray-400">
            We've grown a lot in 12 years, but the rule's been the same since day one — fix it
            right or don't take the job.
          </p>
        </div>

        <ol className="relative border-l border-[#222] pl-6 space-y-7 ml-3">
          {MILESTONES.map((m) => (
            <li key={m.year} className="relative">
              <span className="absolute -left-[34px] top-1.5 w-4 h-4 rounded-full bg-[#F97316] ring-4 ring-[#0A0A0A]" />
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-mono text-lg font-bold text-[#F97316]">{m.year}</span>
                <span className="h-px flex-1 bg-[#222]" />
              </div>
              <p className="text-gray-300 leading-relaxed">{m.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Office card */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-br from-[#141414] to-[#0F0F0F] border border-[#222] rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
          <div className="w-16 h-16 rounded-2xl bg-[#F97316]/15 text-[#F97316] flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold">Drop by the workshop</h3>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Kathmandu, Bagmati Province. We're open Monday through Saturday from 08:00 to 19:00.
              Walk-ins welcome, but appointments get priority bays.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold transition-colors whitespace-nowrap"
          >
            Get directions <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-[#F97316]/30 bg-gradient-to-br from-[#F97316]/15 via-[#F97316]/5 to-transparent p-10 md:p-14 text-center">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#F97316]/15 blur-3xl rounded-full pointer-events-none" />
          <Heart className="w-10 h-10 text-[#F97316] mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold max-w-2xl mx-auto">
            Ready to make your next service easier?
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto">
            Browse parts, book an appointment, or chat with our team — we'll meet you wherever
            you're starting from.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Start shopping
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#141414] border border-[#222] hover:border-[#F97316]/40 text-white font-semibold transition-colors"
            >
              Create an account
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
