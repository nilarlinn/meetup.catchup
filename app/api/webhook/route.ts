import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

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

    const { error } = await admin
      .from("tickets")
      .update({ status: "paid" })
      .eq("stripe_session_id", session.id);

    if (error) {
      console.error("Failed to mark ticket paid:", error);
      // Return 500 so Stripe retries the webhook automatically.
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
