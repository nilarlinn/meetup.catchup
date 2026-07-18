import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { joinEvent } from "./actions";

export const revalidate = 0;

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  const isFree = Number(event.price_baht) === 0;

  return (
    <main className="wrap section" style={{ maxWidth: 640 }}>
      <span className="cat" style={{ display: "block", marginBottom: 6 }}>{event.category}</span>
      <h1>{event.title}</h1>
      <p className="meta">{event.day} {event.month} · {event.location}</p>
      {event.details && <p className="meta">{event.details}</p>}
      {event.description && (
        <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7 }}>{event.description}</p>
      )}
      <p className="price" style={{ fontSize: 20, margin: "18px 0" }}>
        {isFree ? "Free" : `฿${Number(event.price_baht).toFixed(0)}`}
      </p>

      <form action={joinEvent} style={{ marginTop: 24, borderTop: "1px dashed rgba(36,28,16,0.2)", paddingTop: 20 }}>
        <input type="hidden" name="eventId" value={event.id} />
        <div className="form-row">
          <label>Your name</label>
          <input name="name" required placeholder="Jane Doe" />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input name="email" type="email" required placeholder="you@email.com" />
        </div>
        <button className="btn" type="submit">
          {isFree ? "Confirm my spot — free" : `Pay ฿${Number(event.price_baht).toFixed(0)} & join`}
        </button>
        {!isFree && (
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>
            You'll be taken to Stripe's secure checkout to pay by card or scan a Thai QR
            (PromptPay) with your banking app.
          </p>
        )}
      </form>
    </main>
  );
}
