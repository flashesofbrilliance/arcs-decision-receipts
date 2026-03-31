import { createClient } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";

/**
 * Supabase SSR Middleware
 *
 * Refreshes Supabase sessions on every request.
 * This ensures JWT tokens are kept fresh and auth state is synced
 * across all Server Components and API routes.
 *
 * Required for proper SSR auth behavior.
 * See: https://supabase.com/docs/guides/auth/server-side-rendering
 */
export async function middleware(request: NextRequest) {
  return await createClient(request);
}

export const config = {
  matcher: [
    // Run on all routes except static assets and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
