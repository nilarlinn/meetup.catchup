-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- Adds a real DATE column to events. This is what lets the website
-- automatically hide an event once its date has passed, instead of you
-- having to delete it manually. Existing events are left as NULL, which
-- the website treats as "always show" until you re-save them with a date
-- in the admin dashboard (the new "Event date" field).

alter table events add column if not exists event_date date;
