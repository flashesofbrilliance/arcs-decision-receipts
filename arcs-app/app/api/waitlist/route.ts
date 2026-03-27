import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Log for now — swap internals for Airtable/Supabase/Resend without touching this route's contract
  console.log(
    JSON.stringify({
      event: "waitlist_signup",
      email,
      ts: new Date().toISOString(),
    })
  );

  return NextResponse.json({ ok: true });
}
