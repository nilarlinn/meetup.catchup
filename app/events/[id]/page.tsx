import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { joinEvent, payByDirectQR } from "./actions";
import { CalendarDays, Ticket, CreditCard, QrCode } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import PaymentOptions from "@/components/PaymentOptions";
import { formatTime } from "@/lib/format";
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

  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).single();

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
          imageUrl={event.image_url || undefined}
        />
      </div>
      <p className="meta meta-row" style={{ marginTop: 10 }}>
        <CalendarDays size={15} /> {event.day} {event.month}
        {event.start_time ? ` · ${formatTime(event.start_time)}` : ""}
        {event.end_time ? `–${formatTime(event.end_time)}` : ""}
        {" · "}{event.location}
      </p>
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
      ) : isFree ? (
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
            <Ticket size={16} />
            Confirm my spot — free
          </button>
        </form>
      ) : (
        <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 32 }}>
          <PaymentOptions
            hasQR={!!settings?.promptpay_qr_url}
            cardForm={
              <form action={joinEvent}>
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
                  <CreditCard size={16} />
                  {`Pay ฿${Number(event.price_baht).toFixed(0)} & join`}
                </button>
                <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10 }}>
                  You'll be taken to Stripe's secure checkout to pay by card or scan a Thai QR
                  (PromptPay) with your banking app.
                </p>
              </form>
            }
            qrForm={
              <form action={payByDirectQR}>
                <input type="hidden" name="eventId" value={event.id} />
                {settings?.promptpay_qr_url && (
                  <img
                    src={settings.promptpay_qr_url}
                    alt="Scan to pay"
                    style={{ width: 200, height: 200, objectFit: "contain", background: "white", border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16 }}
                  />
                )}
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
                  Scan with your banking app and transfer <strong>฿{Number(event.price_baht).toFixed(0)}</strong> directly.
                  Then fill in your details below to let the organizer know — they'll confirm once they see the payment.
                </p>
                <div className="form-row">
                  <label>Your name</label>
                  <input name="name" required placeholder="Jane Doe" />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input name="email" type="email" required placeholder="you@email.com" />
                </div>
                <button className="btn" type="submit">
                  <QrCode size={16} />
                  I've paid — notify the organizer
                </button>
                <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 10 }}>
                  Your spot is held once you submit this, but only fully confirmed once the organizer
                  checks the payment and confirms — usually within a few hours.
                </p>
              </form>
            }
          />
        </div>
      )}
    </main>
  );
}
