-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- Adds a capacity (max spots) field to events. Leave it blank/NULL for an
-- event and the website just won't show a spots-left count for it, so
-- nothing breaks for events you don't want to cap.

alter table events add column if not exists capacity integer;
