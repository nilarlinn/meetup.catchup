-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- This lets a LOGGED-IN user read tickets that were booked using the same
-- email address as their account — so the new "My Tickets" account page
-- can show someone every ticket they've bought, without exposing anyone
-- else's tickets. Guest checkouts (no account) are unaffected; they still
-- get their confirmation by email as before.

create policy "users can read own tickets by email"
  on tickets for select
  using (auth.jwt() ->> 'email' = email);
