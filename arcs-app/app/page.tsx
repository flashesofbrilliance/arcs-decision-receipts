"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Mock HUD hero visual ─────────────────────────────────────────────────────

function HudHero() {
  const ticks = [
    { pct: 28, label: "Too abstract" },
    { pct: 55, label: "Wrong buyer" },
    { pct: 78, label: "Jargon spike" },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/80">
      {/* Top bar — fake call metadata */}
      <div className="flex items-center justify-between mb-5 text-xs text-slate-500 font-mono">
        <span>ARCS HUD &middot; 00:00 &ndash; 31:42</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          3 room-loss markers
        </span>
      </div>

      {/* Call bar */}
      <div className="relative h-10 w-full rounded-full bg-slate-800">
        {/* Waveform approximation */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center px-3">
          <div className="h-px w-full bg-slate-600" />
        </div>
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${tick.pct}%`, transform: "translateX(-50%)" }}
          >
            <div className="w-0.5 h-full bg-red-500/80 rounded" />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-slate-900 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          </div>
        ))}
      </div>

      {/* Marker labels */}
      <div className="relative mt-3 h-6">
        {ticks.map((tick, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: `${tick.pct}%`, transform: "translateX(-50%)" }}
          >
            <span className="text-xs font-mono text-red-400 whitespace-nowrap">
              {tick.label}
            </span>
          </div>
        ))}
      </div>

      {/* Below bar: suggestion card */}
      <div className="mt-6 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3">
        <p className="text-xs text-slate-500 font-mono mb-1">ARCS &middot; 06:14 &middot; too_academic</p>
        <p className="text-sm text-slate-200">
          &ldquo;You lost them here. Try: <span className="text-emerald-400">&lsquo;This saves your team 10 hours a week.&rsquo;</span>&rdquo;
        </p>
      </div>
    </div>
  );
}

// ─── Waitlist form ────────────────────────────────────────────────────────────

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("idle");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        You&rsquo;re in. We&rsquo;ll reach out when ARCS is ready.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap gap-2 max-w-md">
      <input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 min-w-[200px] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition"
      />
      <button
        type="submit"
        className="rounded-xl bg-white text-slate-950 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 transition"
      >
        Join waitlist
      </button>
      {status === "error" && (
        <p className="w-full text-xs text-red-400 mt-1">Something went wrong. Try again.</p>
      )}
    </form>
  );
}

// ─── FAQ HUD Cards ────────────────────────────────────────────────────────────

function ChatGptCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Isn&rsquo;t this just ChatGPT?</h3>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Before */}
        <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-3 space-y-2">
          <p className="text-slate-500 font-mono uppercase tracking-wide text-[10px]">ChatGPT</p>
          <div className="relative h-5 w-full rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center px-1">
              <div className="h-px w-full bg-slate-700" />
            </div>
          </div>
          <p className="text-slate-500 leading-snug">Flat answer. No memory of where they tuned out.</p>
        </div>
        {/* After */}
        <div className="rounded-lg border border-emerald-700/30 bg-emerald-900/10 p-3 space-y-2">
          <p className="text-emerald-600 font-mono uppercase tracking-wide text-[10px]">ARCS</p>
          <div className="relative h-5 w-full rounded-full bg-slate-800">
            <div className="absolute inset-y-0 left-0 right-0 flex items-center px-1">
              <div className="h-px w-full bg-slate-700" />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 left-[55%] w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
          </div>
          <p className="text-slate-400 leading-snug">Shows you the exact moment — and what to say instead.</p>
        </div>
      </div>
    </div>
  );
}

function WhoCard() {
  const personas = [
    { label: "Founder", sub: "Track which pitches land" },
    { label: "Sales", sub: "Stop losing rooms mid-demo" },
    { label: "Fund", sub: "Score your own LP pitches" },
  ];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Who is this for?</h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        Anyone who suspects they over-explain and loses people before the ask.
      </p>
      <div className="flex flex-col gap-2">
        {personas.map((p) => (
          <div
            key={p.label}
            className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2"
          >
            <span className="text-xs font-medium text-slate-300">{p.label}</span>
            <span className="text-xs text-slate-500">{p.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyNowCard() {
  const corners = [
    { label: "PLG noise", desc: "Signups everywhere, signal nowhere" },
    { label: "Alpha compression", desc: "Everyone has GPT; nobody has memory" },
    { label: "LLM fatigue", desc: "Buyers tune out AI pitches in 90 sec" },
  ];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Why now?</h3>
      <div className="space-y-2">
        {corners.map((c) => (
          <div key={c.label} className="flex items-start gap-2">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            <div>
              <p className="text-xs font-medium text-slate-300">{c.label}</p>
              <p className="text-xs text-slate-500">{c.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 px-3 py-2 text-xs text-slate-400 text-center">
        ARCS exists where these three pressures collide.
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Above the fold */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left: copy + CTA */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                See the moment<br />you lose the room.
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
                ARCS turns your calls and demos into a HUD that shows where
                people tune out&mdash;and how to refine who you talk to and how.
              </p>
            </div>

            <WaitlistForm />

            <p className="text-xs text-slate-600">
              We&rsquo;ll only use your email to contact you about ARCS.
            </p>
          </div>

          {/* Right: HUD visual */}
          <div>
            <HudHero />
          </div>
        </div>
      </section>

      {/* Below the fold: FAQ HUD cards */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-5xl px-6 py-16 space-y-6">
          <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">Common questions</p>
          <div className="grid md:grid-cols-3 gap-5">
            <ChatGptCard />
            <WhoCard />
            <WhyNowCard />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-slate-800/60">
        <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Want to see where you mid-curve right now?
          </p>
          <Link
            href="/jean-claude"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            Try Jean Claude, the Mid-curve Detector
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

    </main>
  );
}
