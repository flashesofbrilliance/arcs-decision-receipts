import { NextRequest, NextResponse } from "next/server";
import {
  analyzeTranscriptWithArcs,
  midCurveScore,
  type Marker,
} from "@/lib/arcs";

export type AnalysisRequest = {
  transcript: string;
  mode: "serious" | "jean-claude";
};

export type AnalysisResponse = {
  markers: Marker[];
  summary: string;
  score: number;
};

export async function POST(req: NextRequest) {
  let body: Partial<AnalysisRequest>;
  try {
    body = (await req.json()) as Partial<AnalysisRequest>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { transcript, mode } = body;

  if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
    return NextResponse.json({ error: "Missing transcript" }, { status: 400 });
  }
  if (mode !== "serious" && mode !== "jean-claude") {
    return NextResponse.json(
      { error: "mode must be 'serious' or 'jean-claude'" },
      { status: 400 }
    );
  }

  const rawMarkers = analyzeTranscriptWithArcs(transcript);

  // Jean-Claude mode: roast-style label prefix
  const markers: Marker[] =
    mode === "jean-claude"
      ? rawMarkers.map((m) => ({
          ...m,
          label: `Mid-curve at ${m.t}: ${m.label}`,
        }))
      : rawMarkers;

  const score = midCurveScore(rawMarkers);

  const summary =
    mode === "jean-claude"
      ? buildJeanClaudeSummary(rawMarkers, score)
      : buildSeriousSummary(rawMarkers);

  // Lightweight logging — guarded by LOG_TRANSCRIPTS env flag
  if (process.env.LOG_TRANSCRIPTS === "true") {
    console.log(
      JSON.stringify({
        event: "analysis",
        mode,
        ts: new Date().toISOString(),
        score,
        snippet: transcript.slice(0, 400),
        markers: rawMarkers.map(({ t, cause, confidence }) => ({
          t,
          cause,
          confidence,
        })),
      })
    );
  }

  return NextResponse.json<AnalysisResponse>({ markers, summary, score });
}

function buildJeanClaudeSummary(markers: Marker[], score: number): string {
  if (score < 20) {
    return `Jean Claude mid-curve score: ${score}/100. Honestly? Impressively clean. You might not be mid-curving.`;
  }
  if (score < 50) {
    return `Jean Claude mid-curve score: ${score}/100. Some drift detected. A few adjustments and you\u2019ll have the room.`;
  }
  if (score < 75) {
    return `Jean Claude mid-curve score: ${score}/100. You went galaxy-brain at least once. The room was nodding. They were not following.`;
  }
  return `Jean Claude mid-curve score: ${score}/100. Full mid-curve detected. You explained the engine before you told them the car goes fast.`;
}

function buildSeriousSummary(markers: Marker[]): string {
  if (markers.length === 1 && markers[0].confidence < 0.4) {
    return "ARCS detected no significant room-loss moments. Strong signal throughout.";
  }
  const causes = markers.map((m) => m.cause).join(", ");
  return `ARCS detected ${markers.length} moment${markers.length > 1 ? "s" : ""} where you may have lost the room (${causes}). See markers for specific suggestions.`;
}
