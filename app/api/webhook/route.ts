import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendTicketConfirmationEmail } from "@/lib/email";

// Stripe calls this URL directly (not from a browser), so we must read the
// raw request body to verify the signature — Next.js route handlers give
// us that via request.text().
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const admin = createAdminClient();

    // Update the ticket, then fetch it back (with its event) so we have
    // everything needed to send the confirmation email.
    const { data: ticket, error } = await admin
      .from("tickets")
      .update({ status: "paid" })
      .eq("stripe_session_id", session.id)
      .select("*, events(*)")
      .single();

    if (error || !ticket) {
      console.error("Failed to mark ticket paid:", error);
      // Return 500 so Stripe retries the webhook automatically.
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    const ev = ticket.events;
    if (ev) {
      await sendTicketConfirmationEmail({
        to: ticket.email,
        name: ticket.name,
        eventTitle: ev.title,
        eventWhen: `${ev.day} ${ev.month}`,
        eventWhere: ev.location,
        paid: true,
        priceLabel: `฿${Number(ev.price_baht).toFixed(0)}`,
      });
    }
  }

  return NextResponse.json({ received: true });
}
