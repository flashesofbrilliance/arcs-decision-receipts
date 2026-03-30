"use client";

import type { RefractedOutput } from "@/lib/types";

interface Props {
  output: RefractedOutput;
}

interface Dimension {
  key: keyof Pick<RefractedOutput, "strategy" | "design" | "copy" | "code">;
  label: string;
  cssClass: string;
  isCode?: boolean;
}

const DIMENSIONS: Dimension[] = [
  { key: "strategy", label: "// STRATEGY", cssClass: "dim-strategy" },
  { key: "design",   label: "// UX · DESIGN", cssClass: "dim-design" },
  { key: "copy",     label: "// COPY",  cssClass: "dim-copy" },
  { key: "code",     label: "// CODE",  cssClass: "dim-code", isCode: true },
];

export default function PrismView({ output }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 h-full overflow-y-auto">
      {DIMENSIONS.map(({ key, label, cssClass, isCode }) => {
        const content = output[key];
        if (!content) return null;

        return (
          <div
            key={key}
            className={`terminal-card ${cssClass} flex flex-col p-3`}
            style={{ minHeight: "120px" }}
          >
            {/* HUD label */}
            <div
              className={`dim-label text-xs tracking-widest uppercase mb-2 font-medium shrink-0`}
              style={{ fontSize: "0.6rem", letterSpacing: "0.2em" }}
            >
              {label}
            </div>
            {/* Content */}
            {isCode ? (
              <pre
                className="text-xs leading-relaxed overflow-x-auto flex-1 whitespace-pre-wrap"
                style={{ color: "rgba(0,240,255,0.8)", fontSize: "0.65rem" }}
              >
                {content}
              </pre>
            ) : (
              <p
                className="text-xs leading-relaxed flex-1"
                style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}
              >
                {content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
