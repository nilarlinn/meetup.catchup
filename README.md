# Meetup Catch Up — deployment guide

This is a real Next.js app: real database (Supabase Postgres), real payments
(Stripe Checkout, priced per event), real admin login. Follow these steps in
order — each one unblocks the next.

## 1. Push this code to GitHub
Create a new GitHub repo and push this folder to it. (If you're not familiar
with git: create the repo on github.com, then in this folder run
`git init && git add . && git commit -m "init" && git remote add origin <your-repo-url> && git push -u origin main`.)

## 2. Set up Supabase (your database)
1. Go to supabase.com → New project. Pick any name/region, set a database password (save it somewhere).
2. Once it's created, go to the **SQL Editor** → New query → paste the entire contents of `supabase/schema.sql` → Run.
   This creates the `events`, `tickets`, and `submissions` tables.
3. Go to **Project Settings → API**. You'll need three values from here in step 4:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (click "reveal") → this is `SUPABASE_SERVICE_ROLE_KEY`
     **Never share this key or put it in client-side code — it bypasses all security rules.**
4. Create your admin login: go to **Authentication → Users → Add user**, enter your email and a password.
   This is what you'll use to log into `/admin/dashboard`.

## 3. Set up Stripe (real payments)
1. You said Stripe is ready — good. Go to **Developers → API keys** in your Stripe dashboard.
   - Copy the **Secret key** → this is `STRIPE_SECRET_KEY`. Start with the **test mode** secret key
     (starts with `sk_test_`) until you've tested the whole flow, then switch to the live key later.
2. You'll set up the webhook (step 5) *after* deploying, because Stripe needs a real live URL to send events to.

## 4. Deploy to Vercel
1. Go to vercel.com → New Project → import the GitHub repo you pushed in step 1.
2. Before deploying, add these Environment Variables (Project Settings → Environment Variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=<from step 2>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from step 2>
   SUPABASE_SERVICE_ROLE_KEY=<from step 2>
   STRIPE_SECRET_KEY=<from step 3>
   STRIPE_WEBHOOK_SECRET=<leave blank for now, comes in step 5>
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ADMIN_EMAILS=you@example.com
   ```
3. Click Deploy. Once it's live, go to **Project Settings → Domains** and add your real domain
   (point your domain's DNS at Vercel as instructed on that screen — usually a CNAME or A record).

## 5. Connect the Stripe webhook (this is what confirms payments)
1. In your Stripe dashboard: **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://yourdomain.com/api/webhook`
3. Select event: `checkout.session.completed`
4. Save, then copy the **Signing secret** (starts with `whsec_`).
5. Back in Vercel, add that as `STRIPE_WEBHOOK_SECRET` in Environment Variables, then redeploy
   (Vercel → Deployments → click the three dots on the latest one → Redeploy).

## 6. Test it end-to-end before going live
1. Add a paid event and a free event from `/admin/dashboard`.
2. Visit the free event on the live site and confirm a spot — check it shows up in the
   dashboard's ticket list as `free_confirmed`.
3. Visit the paid event and pay with a Stripe **test card**: `4242 4242 4242 4242`, any future
   expiry, any CVC. Confirm the ticket shows as `paid` in the dashboard afterward — that
   confirms the webhook is wired correctly.
4. Only once that works, swap `STRIPE_SECRET_KEY` for your **live** secret key (and repeat step 5
   with a live-mode webhook) to start accepting real money.

## What this gets you that the earlier prototype didn't
- Real database — nothing disappears when you refresh or leave the page
- Real Stripe Checkout with a genuinely different price per event, read server-side
- Real admin login (Supabase Auth + email allow-list) instead of a password sitting in
  plain JavaScript
- All writes (events, approvals, payments) happen server-side — nothing sensitive is
  exposed to visitors' browsers

## Reasonable next steps (not included yet)
- Event capacity limits / sold-out handling
- Email confirmations beyond Stripe's built-in receipt
- Refunds/cancellations flow
- Image uploads for events
