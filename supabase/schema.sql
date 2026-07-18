-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run

create extension if not exists pgcrypto;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'social',
  day text not null default '',
  month text not null default '',
  location text not null default '',
  details text not null default '',
  description text not null default '',
  price_baht numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  email text not null,
  stripe_session_id text unique,
  status text not null default 'pending', -- pending | paid | free_confirmed | cancelled
  created_at timestamptz not null default now()
);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  submitter_name text not null default '',
  contact text not null default '',
  title text not null,
  category text not null default 'social',
  price_baht numeric(10,2) not null default 0,
  day text not null default '',
  month text not null default '',
  location text not null default '',
  details text not null default '',
  description text not null default '',
  status text not null default 'pending', -- pending | approved | dismissed
  created_at timestamptz not null default now()
);

-- Row Level Security: the browser (anon key) can only ever READ events.
-- Every write (creating events, tickets, submissions, approvals) happens
-- server-side using the service role key, which bypasses RLS entirely.
alter table events enable row level security;
alter table tickets enable row level security;
alter table submissions enable row level security;

create policy "public can read events"
  on events for select
  using (true);

-- No insert/update/delete policies are defined for any table, and no
-- select policy for tickets/submissions, so anon (browser) access is
-- fully locked down beyond reading the events list. Admin and payment
-- logic all runs through server-side code using the service role key.
