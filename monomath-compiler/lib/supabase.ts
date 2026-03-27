import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "public-anon-key";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("[monomath] NEXT_PUBLIC_SUPABASE_URL not set — copy .env.example → .env.local");
}

/** Browser / client-side client — uses anon key, subject to RLS */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side admin client — uses service_role key, bypasses RLS.
 * ONLY import this in API routes (app/api/**). Never expose to the browser.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey ?? supabaseAnonKey,
  { auth: { persistSession: false } }
);
