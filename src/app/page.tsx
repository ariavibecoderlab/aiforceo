// Public marketing landing page.
// Shares brand + tokens with the rest of the app via globals.css.
import Link from "next/link";
import { ProspectChat } from "@/app/_components/ProspectChat";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AIforCEO",
  applicationCategory: "BusinessApplication",
  description:
    "Six AI Command Executives — CMO, COO, CFO, CEO, CTO, and Aria Chief of Staff — briefed on your business in under 30 minutes. You're the Founder. They execute.",
  offers: { "@type": "Offer", price: "79", priceCurrency: "USD" },
  operatingSystem: "Web",
};

const AGENT_BLOCKS = [
  {
    role: "CMO",
    name: "Maya",
    headline: "Marketing directives. Executed.",
    tag: "Brand voice captured once. Deployed across every channel, every time.",
    bullets: [
      "30-day content calendar — ready to publish",
      "Ad copy: 30 variations, A/B ready, on brief",
      "One idea repurposed across every channel",
      "Brand voice enforced on every output",
    ],
    gradient: "linear-gradient(135deg,#F96167,#FF9966)",
    lightText: false,
  },
  {
    role: "COO",
    name: "Owen",
    headline: "Operations command. Zero exceptions.",
    tag: "Workflows, customer responses, invoice escalations — systematised and running.",
    bullets: [
      "Auto-responder templates for WhatsApp, email, IG",
      "Invoice escalation — 3-tier, polite but firm",
      "Staff onboarding SOPs built to your operation",
      "Daily ops digest delivered at 7am",
    ],
    gradient: "linear-gradient(135deg,#2A9D8F,#43BBAA)",
    lightText: false,
  },
  {
    role: "CFO",
    name: "Felix",
    headline: "Financial command. Board-level clarity.",
    tag: "Paste your P&L. Felix audits it and flags the leaks — in 60 seconds.",
    bullets: [
      "P&L audit: signal extracted, cuts recommended",
      "30/60/90-day cash flow forecast from live data",
      "Leak detection on expense lines outpacing revenue",
      "Scenario modelling: hire, expand, raise prices",
    ],
    gradient: "linear-gradient(135deg,#FFB347,#FFD580)",
    lightText: true,
  },
  {
    role: "CEO",
    name: "Eden",
    headline: "Strategic command. Daily intelligence.",
    tag: "Morning brief, decision log, weekly review — the board advisor you could never afford.",
    bullets: [
      "Daily 7am brief: numbers, priorities, risks",
      "Strategic Q&A with full business context",
      "Friday weekly review against target",
      "Decision log: captures the why — forever",
    ],
    gradient: "linear-gradient(135deg,#C5A572,#E2C28F)",
    lightText: true,
  },
  {
    role: "CTO",
    name: "Tariq",
    headline: "Tech command. ROI-first decisions.",
    tag: "Systems audit, automation roadmap, security checklist — decisive, no jargon.",
    bullets: [
      "Systems audit: map tools, cut duplicates",
      "Top 3 automations — tool, cost, timeline",
      "Security hygiene checklist for your scale",
      "Dashboard and KPI reporting setup",
    ],
    gradient: "linear-gradient(135deg,#0096C7,#00BFFF)",
    lightText: false,
  },
  {
    role: "Chief of Staff",
    name: "Aria",
    headline: "Command the C-Suite. Nothing slips.",
    tag: "Aria briefs all five executives and keeps you one step ahead — always.",
    bullets: [
      "Morning brief across all 5 executive areas",
      "Open loops tracker — no action falls through",
      "Weekly status across all functions in one summary",
      "Board pack assembled before the meeting",
    ],
    gradient: "linear-gradient(135deg,#7C3AED,#A855F7)",
    lightText: false,
  },
] as const;

const STEPS = [
  {
    t: "8 min",
    h: "Profile",
    b: "Industry, size, top challenges, 90-day goals.",
  },
  { t: "6 min", h: "Voice", b: "Drop your website or paste a sample." },
  {
    t: "5 min",
    h: "Financials",
    b: "Upload your latest P&L. CFO analyzes live.",
  },
  { t: "6 min", h: "Connectors", b: "One-click OAuth to your tools." },
  {
    t: "5 min",
    h: "First output",
    b: "Pick one. Receive it before you finish.",
  },
] as const;

export default function Home() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        className="sticky top-0 z-50 backdrop-blur"
        style={{
          background: "rgba(24,25,26,0.94)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-base"
          >
            <span className="logo-mark" />
            AI<span style={{ color: "var(--accent)" }}>for</span>CEO
          </Link>
          <div className="flex gap-7 items-center text-sm font-medium text-[var(--muted)]">
            <a href="#agents" className="hidden md:inline">
              Command Executives
            </a>
            <a href="#how" className="hidden md:inline">
              How it works
            </a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/login" className="btn btn-primary text-sm">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <header className="max-w-6xl mx-auto px-6 py-20">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--panel)] border border-[var(--line)] text-xs font-medium text-[var(--muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] ring-4 ring-[rgba(42,157,143,.18)]" />
          Now accepting founding members
        </span>
        <h1 className="serif text-6xl leading-[1.02] my-5 max-w-3xl">
          Command your business{" "}
          <em className="italic" style={{ color: "var(--accent)" }}>
            like a Fortune 500.
          </em>{" "}
          Starting today.
        </h1>
        <p className="text-lg text-[var(--muted)] max-w-xl mb-7">
          Six AI Command Executives — CMO, COO, CFO, CEO, CTO, and Aria your
          Chief of Staff — briefed on your business in 30 minutes. You&apos;re
          the Founder. They execute.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login" className="btn">
            Claim your C-Suite →
          </Link>
          <Link href="#agents" className="btn btn-ghost">
            Meet your executives
          </Link>
        </div>
      </header>

      <section
        id="agents"
        className="mx-6 my-10 rounded-3xl py-24 px-6 lg:px-12 text-white"
        style={{ background: "var(--primary)" }}
      >
        <div className="max-w-6xl mx-auto">
          <span
            className="inline-block text-xs uppercase tracking-widest font-bold mb-3"
            style={{ color: "var(--gold)" }}
          >
            Your Command Executives
          </span>
          <h2 className="serif text-5xl leading-tight max-w-2xl">
            Six Command Executives.{" "}
            <em className="italic" style={{ color: "var(--gold)" }}>
              One directive:
            </em>{" "}
            grow your business.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {AGENT_BLOCKS.map((b) => (
              <div
                key={b.role}
                className="rounded-3xl p-8"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.10)",
                }}
              >
                <div
                  className="rounded-2xl flex items-center justify-center font-bold text-lg mb-4"
                  style={{
                    background: b.gradient,
                    width: 52,
                    height: 52,
                    color: b.lightText ? "#1E2761" : "#fff",
                  }}
                >
                  {b.name[0]}
                </div>
                <p
                  className="text-[11px] uppercase tracking-widest font-semibold"
                  style={{ color: "rgba(255,255,255,.55)" }}
                >
                  {b.role} · {b.name}
                </p>
                <h3 className="serif text-3xl my-2">{b.headline}</h3>
                <p className="italic text-white/80 mb-4">{b.tag}</p>
                <ul className="space-y-2.5 text-sm text-white/75">
                  {b.bullets.map((x) => (
                    <li key={x} className="pl-5 relative">
                      <span
                        className="absolute left-0 font-bold"
                        style={{ color: "var(--gold)" }}
                      >
                        →
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-24">
        <span
          className="inline-block text-xs uppercase tracking-widest font-bold mb-3"
          style={{ color: "var(--accent)" }}
        >
          Mission Briefing
        </span>
        <h2 className="serif text-5xl leading-tight max-w-3xl">
          From zero to a{" "}
          <em className="italic" style={{ color: "var(--primary)" }}>
            fully-briefed C-Suite.
          </em>{" "}
          Under 30 minutes.
        </h2>
        <div className="grid md:grid-cols-5 gap-4 mt-12">
          {STEPS.map((s, i) => (
            <div key={s.h} className="card">
              <span className="text-[11px] font-semibold text-[var(--primary)] bg-[var(--soft)] px-2 py-0.5 rounded">
                {s.t}
              </span>
              <p
                className="serif text-4xl mt-2"
                style={{ color: "var(--accent)" }}
              >
                0{i + 1}
              </p>
              <h4 className="font-bold mt-1">{s.h}</h4>
              <p className="text-xs text-[var(--muted)] mt-1.5">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="py-24 text-center text-white"
        style={{ background: "var(--accent)" }}
      >
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="serif text-5xl leading-tight">
            Be one of the first 100 founding members.
          </h2>
          <p className="text-lg mt-4 text-white/65">
            Lock in $47/mo lifetime. Setup fee waived for the first 30 seats.
          </p>
          <Link
            href="/login"
            className="btn inline-flex mt-7"
            style={{ background: "#fff", color: "var(--accent)" }}
          >
            Reserve your seat →
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-[var(--line)]">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-sm text-[var(--muted)] flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="logo-mark" />
            <span className="font-bold" style={{ color: "var(--ink)" }}>
              AIforCEO
            </span>
          </div>
          <span>© 2026 AIforCEO. The C-Suite by AI.</span>
        </div>
      </footer>

      <ProspectChat />
    </div>
  );
}
