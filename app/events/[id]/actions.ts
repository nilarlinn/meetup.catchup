"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

export async function joinEvent(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();

  if (!eventId || !name || !email) {
    throw new Error("Name and email are required.");
  }

  const admin = createAdminClient();

  // Always fetch the authoritative price from the database — never trust
  // a price sent from the browser. This is what makes per-event pricing
  // safe: each event has its own price_baht, and we read it server-side
  // right before creating the charge.
  const { data: event, error } = await admin
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    throw new Error("Event not found.");
  }

  const priceBaht = Number(event.price_baht);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // Free event: confirm the spot immediately, no Stripe involved.
  if (priceBaht <= 0) {
    await admin.from("tickets").insert({
      event_id: event.id,
      name,
      email,
      status: "free_confirmed",
    });
    redirect(`/success?event=${event.id}`);
  }

  // Paid event: create a real Stripe Checkout Session with THIS event's
  // own price. Stripe hosts the actual card entry — card details never
  // touch our server.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "thb",
          unit_amount: Math.round(priceBaht * 100), // satang
          product_data: { name: event.title },
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/events/${event.id}`,
    metadata: { event_id: event.id, name, email },
  });

  // Record a pending ticket now; the webhook flips it to "paid" once
  // Stripe confirms the charge actually went through.
  await admin.from("tickets").insert({
    event_id: event.id,
    name,
    email,
    stripe_session_id: session.id,
    status: "pending",
  });

  redirect(session.url!);
}
