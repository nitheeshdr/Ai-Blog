import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client.
// Uses service_role key to bypass RLS for API routes.
// Falls back to anon key only for read operations (RLS blocks writes).
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Always prefer service role key for full DB access
  const key = serviceRoleKey && serviceRoleKey.length > 20 ? serviceRoleKey : anonKey;

  if (!serviceRoleKey || serviceRoleKey.length < 20) {
    console.warn(
      "⚠️  [Supabase] SUPABASE_SERVICE_ROLE_KEY is missing — using anon key. " +
      "DB writes may be blocked by RLS. Get the service_role key from Supabase Dashboard → Settings → API."
    );
  }

  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Always create a fresh client (don't cache — env may change in dev)
export function getServerClient() {
  return createServerClient();
}
