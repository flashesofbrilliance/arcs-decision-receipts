// ARCS analysis engine — heuristic v1
// Detects 4 "lose-the-room" patterns in a transcript.
// Forward-designed for future replacement with a real ARCS backend:
// swap analyzeTranscriptWithArcs internals without changing callers.

export type MarkerKind = "mid_curve" | "drift" | "drop";

export type MarkerCause =
  | "too_academic"
  | "category_drift"
  | "no_benefit"
  | "jargon_density";

export type Marker = {
  t: string;                            // positional timestamp placeholder e.g. "06:14"
  kind: MarkerKind;
  kinematics?: { order: number; delta: number };
  cause: MarkerCause;
  label: string;
  suggestion: string;
  confidence: number;                   // 0–1
};

// ─── Detector helpers ────────────────────────────────────────────────────────

const ACADEMIC_TOKENS = [
  "abductive",
  "epistemology",
  "epistemological",
  "ontology",
  "ontological",
  "phenomenology",
  "phenomenological",
  "decision physics",
  "free energy",
  "bayesian free",
  "first principles reasoning",
  "dialectic",
  "heuristic framework",
  "meta-operator",
  "kinematics",
];

const JARGON_TOKENS = [
  "llm wrapper",
  "vector collision",
  "mandala",
  "severance",
  "recoil protocol",
  "derivative atom",
  "snap/pop/lock",
  "plié",
  "élevé",
  "context capsule",
  "link receipt",
  "mandala policy",
  "global serializability",
  "yoav axiom",
  "periodic table",
];

const BENEFIT_TOKENS = [
  "time",
  "hours",
  "hour",
  "money",
  "revenue",
  "cost",
  "costs",
  "risk",
  "headache",
  "save",
  "saves",
  "saving",
  "faster",
  "cheaper",
  "budget",
  "profitable",
  "roi",
  "week",
  "days",
];

const DRIFT_PHRASES = [
  "we do a lot of things",
  "we do many things",
  "it does everything",
  "platform for",
  "we also do",
  "we can also",
  "and also we",
  "many use cases",
  "lots of use cases",
  "all kinds of",
];

// Placeholder timestamps — evenly spaced across a notional 30-min call.
const TIMESTAMP_POOL = [
  "03:12", "06:14", "09:40", "12:03", "14:55",
  "17:22", "20:08", "23:45", "27:01",
];

function pickTimestamp(index: number): string {
  return TIMESTAMP_POOL[index % TIMESTAMP_POOL.length];
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function analyzeTranscriptWithArcs(transcript: string): Marker[] {
  const lower = transcript.toLowerCase();
  const candidates: Marker[] = [];

  // 1. too_academic — philosophy / high-altitude language density
  const academicHits = ACADEMIC_TOKENS.filter((t) => lower.includes(t));
  if (academicHits.length > 0) {
    const conf = Math.min(0.95, 0.55 + academicHits.length * 0.1);
    candidates.push({
      t: pickTimestamp(0),
      kind: "mid_curve",
      kinematics: { order: 3, delta: conf },
      cause: "too_academic",
      label: "Philosophy lecture incoming",
      suggestion: "Say: 'This saves your team 10 hours a week.' Then stop.",
      confidence: conf,
    });
  }

  // 2. category_drift — "we do a lot of things" sprawl
  const driftHits = DRIFT_PHRASES.filter((p) => lower.includes(p));
  // Also catch excessive "and also" chains
  const andAlsoCount = (lower.match(/and also/g) ?? []).length;
  if (driftHits.length > 0 || andAlsoCount >= 3) {
    const conf = Math.min(0.9, 0.6 + driftHits.length * 0.1 + andAlsoCount * 0.05);
    candidates.push({
      t: pickTimestamp(1),
      kind: "drift",
      kinematics: { order: 2, delta: conf },
      cause: "category_drift",
      label: "Category drift — you\u2019re selling a religion",
      suggestion: "Pick one: what does it do in one sentence? Start there.",
      confidence: conf,
    });
  }

  // 3. no_benefit — long transcript with no time/money/headache language
  if (transcript.length > 200) {
    const hasBenefit = BENEFIT_TOKENS.some((t) => lower.includes(t));
    if (!hasBenefit) {
      const conf = 0.75 + Math.min(0.2, transcript.length / 5000);
      candidates.push({
        t: pickTimestamp(2),
        kind: "drop",
        kinematics: { order: 1, delta: conf },
        cause: "no_benefit",
        label: "No benefit landed — features without stakes",
        suggestion:
          "Add: \u2018This saves [X] or costs you [Y] if you skip it.\u2019",
        confidence: conf,
      });
    }
  }

  // 4. jargon_density — too many insider terms
  const jargonHits = JARGON_TOKENS.filter((t) => lower.includes(t));
  if (jargonHits.length >= 2) {
    const conf = Math.min(0.92, 0.5 + jargonHits.length * 0.12);
    candidates.push({
      t: pickTimestamp(3),
      kind: "mid_curve",
      kinematics: { order: 3, delta: conf },
      cause: "jargon_density",
      label: "Jargon spike — they\u2019re nodding but lost",
      suggestion:
        "Replace one jargon term with the plain version. Try it out loud right now.",
      confidence: conf,
    });
  }

  // Sort by confidence descending, cap at 3
  const sorted = candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 3);

  // Fallback: always return at least one marker
  if (sorted.length === 0) {
    return [
      {
        t: "00:00",
        kind: "drop",
        cause: "no_benefit",
        label: "Actually pretty clean — no obvious mid-curve detected",
        suggestion:
          "Keep the first sentence short and benefit-first. You\u2019re close.",
        confidence: 0.3,
      },
    ];
  }

  return sorted;
}

// ─── Score helper ─────────────────────────────────────────────────────────────

export function midCurveScore(markers: Marker[]): number {
  return Math.min(
    100,
    markers.reduce((sum, m) => sum + Math.round(m.confidence * 33), 0)
  );
}

// ─── Dominant cause ──────────────────────────────────────────────────────────

export function dominantCause(markers: Marker[]): MarkerCause {
  const counts: Record<string, number> = {};
  for (const m of markers) {
    counts[m.cause] = (counts[m.cause] ?? 0) + 1;
  }
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "no_benefit") as MarkerCause;
}
