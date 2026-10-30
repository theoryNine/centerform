import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

// Anon-key client for guest reads. Unlike ./server.ts it never touches cookies(), so pages
// that use it can be statically generated and revalidated (ISR). Guests have no Supabase
// session (auth is NextAuth), so this returns exactly what the cookie-aware client would.
export function createPublicClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
