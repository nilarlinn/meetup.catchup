import { createBrowserClient } from "@supabase/ssr";

// Used only in Client Components (e.g. the admin login form) to sign in.
// Uses the public anon key — safe to expose to the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
