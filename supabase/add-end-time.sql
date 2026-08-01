-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- Adds an optional end time to events, so the website can hide an event
-- right when it actually finishes (e.g. 4:00 PM) instead of only at the
-- end of the whole day. Leave it blank for an event and the website
-- falls back to hiding it at the end of that day, same as before.

alter table events add column if not exists end_time time;
