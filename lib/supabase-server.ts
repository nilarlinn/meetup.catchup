import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use this in Server Components / Server Actions when you need the
// CURRENT USER'S session (e.g. checking if an admin is logged in).
// It respects Row Level Security — it can only do what the anon key
// and RLS policies allow.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component during render — safe to ignore,
            // middleware.ts handles refreshing the session cookie.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // same as above
          }
        },
      },
    }
  );
}
