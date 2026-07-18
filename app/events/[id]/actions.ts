"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";
import { sendTicketConfirmationEmail } from "@/lib/email";

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
  const eventWhen = `${event.day} ${event.month}`;

  // Free event: confirm the spot immediately, no Stripe involved.
  if (priceBaht <= 0) {
    await admin.from("tickets").insert({
      event_id: event.id,
      name,
      email,
      status: "free_confirmed",
    });

    await sendTicketConfirmationEmail({
      to: email,
      name,
      eventTitle: event.title,
      eventWhen,
      eventWhere: event.location,
      paid: false,
      priceLabel: "Free",
    });

    redirect(`/success?event=${event.id}`);
  }

  // Paid event: create a real Stripe Checkout Session with THIS event's
  // own price. Stripe hosts the actual payment entry — card/QR details
  // never touch our server.
  //
  // "card" and "promptpay" both work for THB. PromptPay renders as a
  // real Thai QR code on Stripe's checkout page for the customer to
  // scan and pay with their banking app.
  //
  // IMPORTANT: PromptPay must also be turned on in your Stripe Dashboard
  // (Settings > Payment methods) or Stripe will silently fall back to
  // card-only — see the README.
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card", "promptpay"],
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

  // Record a pending ticket now; the webhook flips it to "paid" (and
  // sends the confirmation email) once Stripe confirms the charge
  // actually went through — this works the same for both card and
  // PromptPay payments.
  await admin.from("tickets").insert({
    event_id: event.id,
    name,
    email,
    stripe_session_id: session.id,
    status: "pending",
  });

  redirect(session.url!);
}
