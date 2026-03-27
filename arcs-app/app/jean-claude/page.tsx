"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnalysisResponse } from "@/app/api/analyze/route";
import type { Marker, MarkerCause } from "@/lib/arcs";

// ─── Call bar ────────────────────────────────────────────────────────────────

function CallBar({ markers }: { markers: Marker[] }) {
  return (
    <div className="relative h-8 w-full rounded-full bg-slate-800 overflow-visible mt-2">
      {/* Base waveform line */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center px-2">
        <div className="h-0.5 w-full bg-slate-600 rounded" />
      </div>
      {/* Red tick marks */}
      {markers.map((m, i) => {
        // Distribute ticks evenly across 10–90% of the bar
        const pct = markers.length === 1
          ? 50
          : 10 + (i / (markers.length - 1)) * 80;
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center group"
            style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
          >
            {/* Tick */}
            <div className="w-0.5 h-full bg-red-500 rounded" />
            {/* Dot */}
            <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-slate-950 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 w-48 rounded-lg bg-slate-800 border border-slate-700 p-2 text-xs text-slate-200 shadow-xl">
              <span className="font-mono text-red-400">{m.t}</span>
              <p className="mt-1 text-slate-300 leading-snug">{m.label.replace(/^Mid-curve at \S+: /, "")}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Witty diagnosis ─────────────────────────────────────────────────────────

const DIAGNOSES: Record<MarkerCause, string> = {
  too_academic:
    "Diagnosis: You gave a TED talk. They wanted a price quote.",
  category_drift:
    "Diagnosis: You\u2019re selling a religion. They wanted a feature.",
  no_benefit:
    "Diagnosis: You explained the engine before you said the car goes fast.",
  jargon_density:
    "Diagnosis: They nodded. They were lost by minute three.",
};

function scoreColor(score: number): string {
  if (score < 35) return "text-emerald-400";
  if (score < 65) return "text-amber-400";
  return "text-red-400";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JeanClaudePage() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, mode: "jean-claude" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Analysis failed. Try again.");
        return;
      }

      const data = (await res.json()) as AnalysisResponse;
      setResult(data);
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Compute dominant cause from result
  const dominantCause: MarkerCause | null = result
    ? (() => {
        const counts: Partial<Record<MarkerCause, number>> = {};
        for (const m of result.markers) {
          counts[m.cause] = (counts[m.cause] ?? 0) + 1;
        }
        return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
          null) as MarkerCause | null;
      })()
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-3xl px-6 py-14 space-y-8">

        {/* Header */}
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            April Fools edition — powered by the real ARCS engine
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Jean Claude,<br />
            <span className="text-slate-400">the Mid-curve Detector.</span>
          </h1>
          <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
            For anyone who suspects they mid-curve their own pitches.
            Paste a call, demo, or pitch. Jean Claude tells you exactly when
            you went galaxy-brain and lost the room.
          </p>
        </header>

        {/* Input form */}
        <form onSubmit={onSubmit} className="space-y-3">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your call transcript, pitch notes, or demo script here…"
            rows={7}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition"
          />
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || transcript.trim().length === 0}
            className="rounded-xl bg-emerald-400 text-slate-950 px-5 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-300 transition"
          >
            {loading ? "Clawing through curves\u2026" : "Detect mid-curve moments"}
          </button>
        </form>

        {/* Results */}
        {result && (
          <div className="space-y-6 pt-2">

            {/* Score + call bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className={`text-5xl font-bold tabular-nums ${scoreColor(result.score)}`}>
                  {result.score}
                </span>
                <span className="text-slate-500 text-sm">/100 &mdash; higher = more galaxy-brain</span>
              </div>
              <CallBar markers={result.markers} />
              <p className="text-xs text-slate-500 mt-1">
                Hover the red ticks to see where you lost them.
              </p>
            </div>

            {/* Witty diagnosis */}
            {dominantCause && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
                <p className="text-sm text-amber-300 font-medium">
                  {DIAGNOSES[dominantCause]}
                </p>
              </div>
            )}

            {/* Summary */}
            <p className="text-sm text-slate-400">{result.summary}</p>

            {/* Marker cards */}
            <div className="space-y-3">
              {result.markers.map((m, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-red-400">{m.t}</span>
                    <span className="text-xs text-slate-600">&bull;</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">{m.kind.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{m.label}</p>
                  <p className="text-sm text-slate-400">
                    Try: &ldquo;{m.suggestion}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            {/* CTA to ARCS */}
            <div className="rounded-2xl border border-slate-700 bg-slate-900/40 px-5 py-4 mt-2">
              <p className="text-sm text-slate-300">
                Want the serious HUD that fixes this across your whole team?
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
              >
                See ARCS
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        )}

      </section>
    </main>
  );
}
