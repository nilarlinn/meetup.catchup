import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; event?: string; pending?: string };
}) {
  const supabase = createClient();

  // Direct Thai QR payment — awaiting manual confirmation, not paid via Stripe.
  if (searchParams.event && searchParams.pending) {
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", searchParams.event)
      .single();

    return (
      <main className="wrap section" style={{ maxWidth: 520 }}>
        <div className="note">
          Thanks! We've noted your payment for {event?.title || "the event"} and your spot is being
          held. The organizer will check the transfer and send a final confirmation email shortly.
        </div>
        <a className="btn ghost" href="/">Back to events</a>
      </main>
    );
  }

  // Free event path
  if (searchParams.event) {
    const { data: event } = await supabase
      .from("events")
      .select("title")
      .eq("id", searchParams.event)
      .single();

    return (
      <main className="wrap section" style={{ maxWidth: 520 }}>
        <div className="note" style={{ background: "#E3F5EF", color: "var(--teal)" }}>
          You're confirmed for {event?.title || "the event"}. See you there!
        </div>
        <a className="btn ghost" href="/">Back to events</a>
      </main>
    );
  }

  // Paid event path — check the real status with Stripe directly, so the
  // confirmation shown is never a guess.
  if (searchParams.session_id) {
    const session = await stripe.checkout.sessions.retrieve(searchParams.session_id);
    const paid = session.payment_status === "paid";

    return (
      <main className="wrap section" style={{ maxWidth: 520 }}>
        {paid ? (
          <div className="note" style={{ background: "#E3F5EF", color: "var(--teal)" }}>
            Payment received — your spot is confirmed! A receipt was sent to your email by Stripe.
          </div>
        ) : (
          <div className="note">
            We couldn't confirm your payment yet. If you completed checkout, this can take a
            few seconds — refresh this page, or check your email for a Stripe receipt.
          </div>
        )}
        <a className="btn ghost" href="/">Back to events</a>
      </main>
    );
  }

  return (
    <main className="wrap section">
      <p>Nothing to confirm here.</p>
      <a className="btn ghost" href="/">Back to events</a>
    </main>
  );
}
