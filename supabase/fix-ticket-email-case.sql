-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- Fixes a bug where a ticket wouldn't show up on the "My Tickets" page if
-- the email typed into the Join form had different capitalization than
-- the person's login email (e.g. "Name@Gmail.com" vs "name@gmail.com").
-- Supabase Auth always lowercases login emails, but the email typed into
-- a Join form wasn't being lowercased before — this makes the security
-- rule itself match case-insensitively, so old tickets saved with mixed
-- case now show up too, not just new ones.

drop policy if exists "users can read own tickets by email" on tickets;

create policy "users can read own tickets by email"
  on tickets for select
  using (lower(auth.jwt() ->> 'email') = lower(email));
