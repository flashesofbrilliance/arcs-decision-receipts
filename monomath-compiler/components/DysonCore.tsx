"use client";

import type { RawSignal, RefractedOutput, ProcessingState } from "@/lib/types";
import PrismView from "./PrismView";

interface Props {
  activeSignal: RawSignal | null;
  activeOutput: RefractedOutput | null;
  processingState: ProcessingState;
}

export default function DysonCore({
  activeSignal,
  activeOutput,
  processingState,
}: Props) {
  const stateClass =
    processingState === "plie"
      ? "plie"
      : processingState === "eleve"
      ? "eleve"
      : "";

  return (
    <div className="relative flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,240,255,0.08)" }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(0,240,255,0.6)" }}
        >
          Dyson Core
        </span>
        {processingState !== "idle" && (
          <span
            className="text-xs uppercase tracking-widest"
            style={{
              color:
                processingState === "plie"
                  ? "rgba(255,215,0,0.7)"
                  : "rgba(0,240,255,0.9)",
              fontSize: "0.6rem",
            }}
          >
            {processingState === "plie" ? "▶ COMPILING ···" : "✓ COMMITTED"}
          </span>
        )}
      </div>

      {/* Main glass card */}
      <div className={`glass ${stateClass} flex-1 mx-4 my-4 flex flex-col overflow-hidden`}
        style={{ position: "relative" }}
      >
        {/* Corner bracket labels */}
        <span
          className="absolute top-2 left-3 text-xs tracking-widest select-none"
          style={{ color: "rgba(0,240,255,0.25)", fontSize: "0.6rem" }}
        >
          [ ACTIVE REFRACTION ]
        </span>
        <span
          className="absolute bottom-2 right-3 text-xs tracking-widest select-none"
          style={{ color: "rgba(0,240,255,0.15)", fontSize: "0.6rem" }}
        >
          MONOMATH v8.5 ]
        </span>

        {/* Empty state */}
        {!activeSignal && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div
              className="text-xs tracking-[0.3em] uppercase text-center cursor-blink"
              style={{ color: "rgba(0,240,255,0.25)" }}
            >
              select a signal to compile
            </div>
            <div
              className="text-xs text-center leading-relaxed max-w-xs"
              style={{ color: "rgba(255,255,255,0.12)", fontSize: "0.65rem" }}
            >
              raw intent → strategy · design · copy · code
            </div>
          </div>
        )}

        {/* Processing / Plié state */}
        {activeSignal && processingState === "plie" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
            <div
              className="text-xs tracking-[0.25em] uppercase text-center"
              style={{ color: "rgba(255,215,0,0.6)" }}
            >
              ▶ refracting signal ···
            </div>
            <div
              className="text-xs leading-relaxed text-center max-w-sm"
              style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem" }}
            >
              &quot;{activeSignal.raw_text.slice(0, 120)}
              {activeSignal.raw_text.length > 120 ? "…" : ""}&quot;
            </div>
            {/* Pulse bars */}
            <div className="flex gap-1.5 items-end h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-sm"
                  style={{
                    height: `${Math.random() * 100}%`,
                    background: "rgba(0,240,255,0.4)",
                    animationName: "plie-pulse",
                    animationDuration: `${0.8 + i * 0.12}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: `${i * 0.07}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Output / PrismView */}
        {activeOutput && processingState !== "plie" && (
          <>
            {/* Raw signal summary bar */}
            <div
              className="px-5 pt-8 pb-2 text-xs leading-relaxed shrink-0"
              style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.65rem", borderBottom: "1px solid rgba(0,240,255,0.06)" }}
            >
              <span style={{ color: "rgba(0,240,255,0.4)" }}>INPUT ›</span>{" "}
              {activeSignal?.raw_text.slice(0, 160)}
              {(activeSignal?.raw_text.length ?? 0) > 160 ? "…" : ""}
            </div>
            <PrismView output={activeOutput} />
          </>
        )}
      </div>
    </div>
  );
}
