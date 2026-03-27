"use client";

import type { RawSignal } from "@/lib/types";

interface Props {
  signals: RawSignal[];
  activeSignalId: string | null;
  onSelect: (signal: RawSignal) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function SignalStream({ signals, activeSignalId, onSelect }: Props) {
  const isEmpty = signals.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-2 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,240,255,0.08)" }}
      >
        <span
          className="text-xs tracking-widest uppercase"
          style={{ color: "rgba(0,240,255,0.6)" }}
        >
          Signal Stream
        </span>
        <span
          className="ml-auto text-xs tabular-nums"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          {signals.length} rx
        </span>
      </div>

      {/* Waterfall */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {isEmpty && (
          <div
            className="text-xs mt-8 text-center leading-relaxed cursor-blink"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            awaiting input
            <br />
            <span style={{ color: "rgba(0,240,255,0.3)", fontSize: "0.65rem" }}>
              submit via tally → n8n → /api/webhook
            </span>
          </div>
        )}

        {signals.map((signal) => {
          const isActive = signal.id === activeSignalId;
          return (
            <button
              key={signal.id}
              onClick={() => onSelect(signal)}
              className="signal-entry w-full text-left px-3 py-2.5 terminal-card transition-all duration-150 block"
              style={{
                borderColor: isActive
                  ? "rgba(0,240,255,0.5)"
                  : "rgba(0,240,255,0.1)",
                background: isActive
                  ? "rgba(0,240,255,0.06)"
                  : "rgba(255,255,255,0.02)",
                boxShadow: isActive ? "0 0 12px rgba(0,240,255,0.1)" : "none",
              }}
            >
              {/* timestamp */}
              <div
                className="text-xs tabular-nums mb-1"
                style={{ color: "rgba(0,240,255,0.4)" }}
              >
                {formatTime(signal.created_at)}
              </div>
              {/* raw text preview */}
              <div
                className="text-xs leading-relaxed line-clamp-3"
                style={{ color: isActive ? "#e0e0e0" : "rgba(255,255,255,0.45)" }}
              >
                {signal.raw_text}
              </div>
              {/* source badge */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className="text-xs tracking-widest uppercase px-1.5 py-0.5"
                  style={{
                    color: "rgba(255,215,0,0.5)",
                    border: "1px solid rgba(255,215,0,0.2)",
                    fontSize: "0.55rem",
                  }}
                >
                  {signal.source}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
