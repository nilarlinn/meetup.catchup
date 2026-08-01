-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- Adds a start time to match the end_time column, so both are proper
-- time pickers in the admin form instead of typing "2:00-4:00 PM" by
-- hand into the location field.

alter table events add column if not exists start_time time;
