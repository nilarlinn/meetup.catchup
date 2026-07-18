import { createClient } from "@supabase/supabase-js";

// DANGER: this client uses the SERVICE ROLE key, which bypasses Row Level
// Security completely. Only ever import this file from server-side code
// (Server Actions, Route Handlers) — never from a Client Component, and
// never send this key to the browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
