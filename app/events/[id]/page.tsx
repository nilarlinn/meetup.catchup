import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { joinEvent } from "./actions";
import { CalendarDays, Ticket, CreditCard } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import type { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) return {};

  const title = `${event.title} | Meetup Catch Up`;
  const description = event.details || event.description || "Padel, pickleball, tennis, running and social meetups in Bangkok.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: event.image_url ? [{ url: event.image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.image_url ? [event.image_url] : [],
    },
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  const isFree = Number(event.price_baht) === 0;

  let spotsLeft: number | null = null;
  if (event.capacity != null) {
    const admin = createAdminClient();
    const { count } = await admin
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("status", ["paid", "free_confirmed"]);
    spotsLeft = Math.max(event.capacity - (count || 0), 0);
  }
  const isSoldOut = spotsLeft === 0;

  return (
    <main className="wrap section" style={{ maxWidth: 700 }}>
      <div
        className="event-hero"
        style={event.image_url ? { backgroundImage: `url(${event.image_url})` } : undefined}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span className="cat" style={{ display: "block", marginBottom: 10 }}>{event.category}</span>
          <h1 style={{ fontSize: 34, margin: 0 }}>{event.title}</h1>
        </div>
        <ShareButton
          title={event.title}
          url={`${process.env.NEXT_PUBLIC_SITE_URL}/events/${event.id}`}
        />
      </div>
      <p className="meta meta-row" style={{ marginTop: 10 }}><CalendarDays size={15} /> {event.day} {event.month} · {event.location}</p>
      {event.details && <p className="meta">{event.details}</p>}
      {event.description && (
        <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.9, color: "var(--ink)", fontWeight: 300, whiteSpace: "pre-line" }}>{event.description}</p>
      )}
      <p className="price" style={{ fontSize: 22, margin: "28px 0", borderTop: "none", paddingTop: 0 }}>
        {isFree ? "Free" : `฿${Number(event.price_baht).toFixed(0)}`}
      </p>
      {spotsLeft !== null && (
        <p className={`meta spots-left ${isSoldOut ? "spots-full" : ""}`} style={{ marginTop: -20, marginBottom: 20 }}>
          {isSoldOut ? "Sold out" : `${spotsLeft} of ${event.capacity} spots left`}
        </p>
      )}

      {isSoldOut ? (
        <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 32 }}>
          <p style={{ color: "var(--wine)", fontWeight: 500 }}>This event is fully booked.</p>
        </div>
      ) : (
        <form action={joinEvent} style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 32 }}>
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
            {isFree ? <Ticket size={16} /> : <CreditCard size={16} />}
            {isFree ? "Confirm my spot — free" : `Pay ฿${Number(event.price_baht).toFixed(0)} & join`}
          </button>
          {!isFree && (
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10 }}>
              You'll be taken to Stripe's secure checkout to pay by card or scan a Thai QR
              (PromptPay) with your banking app.
            </p>
          )}
        </form>
      )}
    </main>
  );
}
