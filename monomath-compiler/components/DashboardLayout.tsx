"use client";

import { useEffect, useState, useCallback } from "react";
import type { RawSignal, RefractedOutput, ProcessingState } from "@/lib/types";
import SignalStream from "./SignalStream";
import DysonCore from "./DysonCore";
import ExecutiveFunction from "./ExecutiveFunction";

export default function DashboardLayout() {
  const [signals, setSignals] = useState<RawSignal[]>([]);
  const [activeSignal, setActiveSignal] = useState<RawSignal | null>(null);
  const [activeOutput, setActiveOutput] = useState<RefractedOutput | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>("idle");

  /* ── Poll /api/signals every 5s to pick up new Tally submissions ── */
  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch("/api/signals");
      if (!res.ok) return;
      const data: RawSignal[] = await res.json();
      setSignals((prev) => {
        // merge new signals to top without duplicates
        const existingIds = new Set(prev.map((s) => s.id));
        const fresh = data.filter((s) => !existingIds.has(s.id));
        return fresh.length > 0 ? [...fresh, ...prev] : prev;
      });
    } catch {
      // silently ignore network errors during polling
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 5000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  /* ── Select a signal and simulate the refraction pipeline ── */
  const selectSignal = useCallback((signal: RawSignal) => {
    setActiveSignal(signal);
    setActiveOutput(null);
    setProcessingState("plie");

    // In production this output comes from n8n → Supabase → /api/signals/:id
    // Here we simulate a 1.8s compilation delay, then Élevé flash.
    setTimeout(() => {
      const mock: RefractedOutput = {
        id: crypto.randomUUID(),
        signal_id: signal.id,
        created_at: new Date().toISOString(),
        strategy:
          "Define the single constraint that, if removed, unlocks the most downstream value. Sequence milestones around that constraint first.",
        design:
          "Reduce cognitive load at the decision moment. One primary action per screen. Use progressive disclosure for secondary paths.",
        copy:
          "Lead with the outcome the user already wants. Name the enemy (the friction, the cost, the delay). Make the CTA feel inevitable.",
        code:
          "// Webhook receiver — thin adapter, no business logic\nexport async function POST(req: Request) {\n  const payload = await req.json();\n  await supabase.from('raw_signals').insert({ raw_text: extractText(payload) });\n  return Response.json({ ok: true });\n}",
        full_output: null,
      };
      setActiveOutput(mock);
      setProcessingState("eleve");
      setTimeout(() => setProcessingState("idle"), 1000);
    }, 1800);
  }, []);

  return (
    <div className="relative z-10 flex h-screen w-screen overflow-hidden">
      {/* ── Header bar ── */}
      <div
        className="absolute top-0 left-0 right-0 h-10 flex items-center px-4 z-20"
        style={{ borderBottom: "1px solid rgba(0,240,255,0.1)" }}
      >
        <span
          className="text-xs tracking-[0.25em] uppercase"
          style={{ color: "rgba(0,240,255,0.5)" }}
        >
          ARCS ◈ MONOMATH COMPILER
        </span>
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          v8.5 · PHASE LOCK ACTIVE
        </span>
        <span
          className="ml-4 w-1.5 h-1.5 rounded-full inline-block"
          style={{
            background:
              processingState === "plie"
                ? "#FFD700"
                : processingState === "eleve"
                ? "#00F0FF"
                : "rgba(0,240,255,0.35)",
            boxShadow:
              processingState === "idle"
                ? "none"
                : `0 0 6px ${processingState === "eleve" ? "#00F0FF" : "#FFD700"}`,
          }}
        />
      </div>

      {/* ── 3-Column Bento Grid ── */}
      <div
        className="flex flex-1 pt-10"
        style={{
          display: "grid",
          gridTemplateColumns: "25% 50% 25%",
          height: "100%",
        }}
      >
        {/* Left: Signal Stream */}
        <div style={{ borderRight: "1px solid rgba(0,240,255,0.08)" }}>
          <SignalStream
            signals={signals}
            activeSignalId={activeSignal?.id ?? null}
            onSelect={selectSignal}
          />
        </div>

        {/* Center: Dyson Core */}
        <DysonCore
          activeSignal={activeSignal}
          activeOutput={activeOutput}
          processingState={processingState}
        />

        {/* Right: Executive Function */}
        <div style={{ borderLeft: "1px solid rgba(0,240,255,0.08)" }}>
          <ExecutiveFunction
            activeSignal={activeSignal}
            activeOutput={activeOutput}
            processingState={processingState}
            onRefresh={fetchSignals}
          />
        </div>
      </div>
    </div>
  );
}
