-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- Remembers how many people joined an event outside the website (LINE,
-- Instagram, walk-ins), so "Spots left" can be changed in the admin page
-- while the capacity stays the same.

alter table events add column if not exists outside_joined integer not null default 0;
