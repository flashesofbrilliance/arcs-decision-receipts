/**
 * Signals API
 *
 * GET  /api/signals         → latest 50 raw_signals (for the Signal Stream)
 * POST /api/signals         → tag / annotate a signal (links output + tags)
 */

import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("raw_signals")
    .select("id, created_at, raw_text, source, metadata")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data ?? []);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { signal_id, output_id, tags } = body as {
    signal_id?: string;
    output_id?: string;
    tags?: string[];
  };

  if (!signal_id) {
    return Response.json({ error: "signal_id required" }, { status: 422 });
  }

  // Log the annotation event
  const { error } = await supabase.from("system_logs").insert({
    event_type: "signal_annotated",
    payload: { signal_id, output_id, tags },
    status: "ok",
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
