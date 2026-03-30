/**
 * Drop Zone — Tally Webhook Receiver
 *
 * Configure your Tally form to POST to:
 *   https://your-domain.com/api/webhook
 *
 * Or point your n8n "Webhook" node here (local: http://localhost:3000/api/webhook).
 *
 * Payload shape: TallyWebhookPayload (see lib/types.ts)
 * n8n can also POST its own processed payload directly.
 */

import { createAdminClient } from "@/utils/supabase/server";

const supabase = createAdminClient();
import type { TallyWebhookPayload } from "@/lib/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // ── Extract raw text from Tally payload ──────────────────────────
  let raw_text = "";
  let source: "tally" | "manual" | "api" = "api";
  let metadata: Record<string, unknown> = {};

  if (isTallyPayload(body)) {
    source = "tally";
    const fields = body.data.fields;
    // Concatenate all non-empty text fields into the raw brain-dump
    raw_text = fields
      .map((f) => {
        if (typeof f.value === "string") return f.value.trim();
        if (Array.isArray(f.value)) return f.value.join(", ");
        return "";
      })
      .filter(Boolean)
      .join("\n\n");

    metadata = {
      tally_form_id: body.data.formId,
      tally_response_id: body.data.responseId,
      tally_submission_id: body.data.submissionId,
    };
  } else if (
    typeof body === "object" &&
    body !== null &&
    "raw_text" in body &&
    typeof (body as Record<string, unknown>).raw_text === "string"
  ) {
    // Direct POST from n8n or manual testing: { raw_text: "..." }
    raw_text = ((body as Record<string, unknown>).raw_text as string).trim();
    source = "manual";
    metadata = (body as Record<string, unknown>).metadata as Record<string, unknown> ?? {};
  }

  if (!raw_text) {
    return Response.json({ error: "No text content found in payload" }, { status: 422 });
  }

  // ── Insert into Supabase raw_signals ────────────────────────────
  const { data, error } = await supabase
    .from("raw_signals")
    .insert({ raw_text, source, metadata })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[webhook] Supabase insert error:", error.message);
    // Don't expose internal errors; still return ok so Tally/n8n don't retry endlessly
    return Response.json(
      { ok: false, error: "Database write failed", detail: error.message },
      { status: 500 }
    );
  }

  // ── Log the event ────────────────────────────────────────────────
  await supabase.from("system_logs").insert({
    event_type: "signal_received",
    payload: { signal_id: data.id, source, char_count: raw_text.length },
    status: "ok",
  });

  return Response.json({ ok: true, signal_id: data.id }, { status: 201 });
}

function isTallyPayload(body: unknown): body is TallyWebhookPayload {
  return (
    typeof body === "object" &&
    body !== null &&
    "eventType" in body &&
    (body as Record<string, unknown>).eventType === "FORM_RESPONSE" &&
    "data" in body &&
    typeof (body as Record<string, unknown>).data === "object"
  );
}
