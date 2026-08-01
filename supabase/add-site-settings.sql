-- Run this once in your Supabase project: Dashboard > SQL Editor > New query > paste > Run
--
-- A single-row settings table. Right now it just holds the photo of your
-- own PromptPay QR code, so customers can pay you directly (instant to
-- your bank account, no Stripe payout wait) as an alternative to card/
-- Stripe PromptPay checkout.

create table if not exists site_settings (
  id int primary key default 1,
  promptpay_qr_url text not null default '',
  constraint single_row check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

alter table site_settings enable row level security;

create policy "anyone can read site settings"
  on site_settings for select
  using (true);
