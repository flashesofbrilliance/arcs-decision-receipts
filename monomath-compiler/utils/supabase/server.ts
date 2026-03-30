import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** SSR-aware client — uses publishable key, respects RLS, session-aware */
export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore
        }
      },
    },
  });
};

/**
 * Admin client — uses service_role key, bypasses RLS entirely.
 * Use ONLY in server-side API routes. Never expose to the browser.
 */
export const createAdminClient = () =>
  createSupabaseClient(supabaseUrl, serviceRoleKey ?? supabaseKey, {
    auth: { persistSession: false },
  });
