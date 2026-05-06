import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client using service role key (bypasses RLS)
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Singleton for API routes
let _serverClient: ReturnType<typeof createServerClient> | null = null;
export function getServerClient() {
  if (!_serverClient) {
    _serverClient = createServerClient();
  }
  return _serverClient;
}
