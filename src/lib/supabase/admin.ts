import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

// Service role client — bypasses RLS entirely.
// ONLY use this in server-side code (Server Components, Server Actions, Route Handlers).
// NEVER import this in client components or expose the key to the browser.
export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
