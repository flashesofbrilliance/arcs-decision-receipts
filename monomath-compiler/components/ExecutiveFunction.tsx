"use client";

import { useState } from "react";
import type { RawSignal, RefractedOutput, ProcessingState } from "@/lib/types";

interface Props {
  activeSignal: RawSignal | null;
  activeOutput: RefractedOutput | null;
  processingState: ProcessingState;
  onRefresh: () => void;
}

const PRESET_TAGS = ["strategy", "decision", "problem", "idea", "code", "design"];

export default function ExecutiveFunction({
  activeSignal,
  activeOutput,
  processingState,
  onRefresh,
}: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setCustomTag("");
  }

  async function handleSync() {
    if (!activeSignal || !activeOutput) return;
    setSyncStatus("syncing");
    try {
      await fetch("/api/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal_id: activeSignal.id,
          output_id: activeOutput.id,
          tags,
        }),
      });
      setSyncStatus("synced");
      setTimeout(() => setSyncStatus("idle"), 2500);
    } catch {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  }

  const syncLabel =
    syncStatus === "syncing"
      ? "SYNCING ···"
      : syncStatus === "synced"
      ? "✓ COMMITTED"
      : syncStatus === "error"
      ? "✗ SYNC FAILED"
      : "PUSH TO SUPABASE";

  const syncColor =
    syncStatus === "synced"
      ? "#00F0FF"
      : syncStatus === "error"
      ? "#FF4455"
      : syncStatus === "syncing"
      ? "rgba(255,215,0,0.8)"
      : "rgba(0,240,255,0.6)";

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
          Executive Function
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* Sync status badge */}
        <div className="terminal-card px-3 py-3 flex flex-col gap-2">
          <div
            className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(0,240,255,0.4)", fontSize: "0.6rem" }}
          >
            Supabase Sync
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: syncColor,
                boxShadow: syncStatus !== "idle" ? `0 0 6px ${syncColor}` : "none",
              }}
            />
            <span
              className="text-xs tracking-widest"
              style={{ color: syncColor, fontSize: "0.65rem" }}
            >
              {syncLabel}
            </span>
          </div>
          {processingState === "eleve" && (
            <div
              className="text-xs mt-1"
              style={{ color: "rgba(0,240,255,0.4)", fontSize: "0.6rem" }}
            >
              global history committed
            </div>
          )}
        </div>

        {/* Processing state indicator */}
        <div className="terminal-card px-3 py-3">
          <div
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "rgba(0,240,255,0.4)", fontSize: "0.6rem" }}
          >
            System State
          </div>
          <div className="flex gap-2 items-center">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background:
                  processingState === "plie"
                    ? "#FFD700"
                    : processingState === "eleve"
                    ? "#00F0FF"
                    : "rgba(255,255,255,0.15)",
              }}
            />
            <span
              className="text-xs uppercase tracking-widest"
              style={{
                color:
                  processingState === "plie"
                    ? "rgba(255,215,0,0.7)"
                    : processingState === "eleve"
                    ? "rgba(0,240,255,0.9)"
                    : "rgba(255,255,255,0.2)",
                fontSize: "0.65rem",
              }}
            >
              {processingState === "idle"
                ? "IDLE"
                : processingState === "plie"
                ? "PLIÉ — YIELDING"
                : "ÉLEVÉ — FLOW"}
            </span>
          </div>
        </div>

        {/* Tag module */}
        <div className="terminal-card px-3 py-3">
          <div
            className="text-xs tracking-widest uppercase mb-2"
            style={{ color: "rgba(0,240,255,0.4)", fontSize: "0.6rem" }}
          >
            Tags
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {PRESET_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className="text-xs px-2 py-0.5 transition-all duration-100"
                style={{
                  border: tags.includes(tag)
                    ? "1px solid rgba(0,240,255,0.6)"
                    : "1px solid rgba(255,255,255,0.12)",
                  color: tags.includes(tag) ? "#00F0FF" : "rgba(255,255,255,0.35)",
                  background: tags.includes(tag)
                    ? "rgba(0,240,255,0.08)"
                    : "transparent",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
              placeholder="custom tag"
              className="flex-1 bg-transparent text-xs px-2 py-1 outline-none"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
                fontSize: "0.65rem",
              }}
            />
            <button
              onClick={addCustomTag}
              className="text-xs px-2 py-1"
              style={{
                border: "1px solid rgba(0,240,255,0.3)",
                color: "rgba(0,240,255,0.7)",
                fontSize: "0.6rem",
              }}
            >
              +
            </button>
          </div>
          {tags.length > 0 && (
            <div
              className="mt-2 text-xs"
              style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.6rem" }}
            >
              [{tags.join(", ")}]
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={handleSync}
            disabled={!activeOutput || syncStatus === "syncing"}
            className="w-full text-xs py-2.5 px-3 tracking-widest uppercase transition-all duration-150"
            style={{
              border: `1px solid ${activeOutput ? syncColor : "rgba(255,255,255,0.1)"}`,
              color: activeOutput ? syncColor : "rgba(255,255,255,0.2)",
              background: activeOutput
                ? "rgba(0,240,255,0.04)"
                : "transparent",
              fontSize: "0.62rem",
              cursor: activeOutput ? "pointer" : "not-allowed",
            }}
          >
            {syncLabel}
          </button>

          <button
            onClick={onRefresh}
            className="w-full text-xs py-2 px-3 tracking-widest uppercase transition-all duration-150"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.25)",
              fontSize: "0.62rem",
            }}
          >
            ↻ REFRESH STREAM
          </button>
        </div>

        {/* Signal metadata */}
        {activeSignal && (
          <div className="terminal-card px-3 py-3 space-y-1.5">
            <div
              className="text-xs tracking-widest uppercase mb-1"
              style={{ color: "rgba(0,240,255,0.4)", fontSize: "0.6rem" }}
            >
              Signal Metadata
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem" }}>
              <span style={{ color: "rgba(0,240,255,0.4)" }}>ID</span>{" "}
              {activeSignal.id.slice(0, 16)}…
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem" }}>
              <span style={{ color: "rgba(0,240,255,0.4)" }}>SRC</span>{" "}
              {activeSignal.source}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.6rem" }}>
              <span style={{ color: "rgba(0,240,255,0.4)" }}>RX</span>{" "}
              {new Date(activeSignal.created_at).toISOString().replace("T", " ").slice(0, 19)}Z
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
