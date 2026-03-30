export type SignalSource = "tally" | "manual" | "api";

export type ProcessingState = "idle" | "plie" | "eleve";

export interface RawSignal {
  id: string;
  created_at: string;
  raw_text: string;
  source: SignalSource;
  metadata: Record<string, unknown> | null;
  /** pgvector — not returned by default selects */
  embedding?: number[];
}

export interface RefractedOutput {
  id: string;
  signal_id: string;
  created_at: string;
  strategy: string | null;
  design: string | null;
  copy: string | null;
  code: string | null;
  full_output: Record<string, unknown> | null;
  embedding?: number[];
}

export interface SystemLog {
  id: string;
  created_at: string;
  event_type: string;
  payload: Record<string, unknown> | null;
  status: "ok" | "error" | "pending";
}

/** Tally form webhook payload shape */
export interface TallyWebhookPayload {
  eventId: string;
  eventType: "FORM_RESPONSE";
  createdAt: string;
  data: {
    responseId: string;
    submissionId: string;
    respondentId: string;
    formId: string;
    formName: string;
    createdAt: string;
    fields: TallyField[];
  };
}

export interface TallyField {
  id: string;
  title: string;
  type: string;
  value: string | string[] | number | boolean | null;
}

/** The four refraction dimensions returned by n8n/Claude */
export interface RefractionDimensions {
  strategy: string;
  design: string;
  copy: string;
  code: string;
}
