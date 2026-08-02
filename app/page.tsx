import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { formatTime } from "@/lib/format";
import { Search } from "lucide-react";

export const revalidate = 0; // always fetch fresh

const CATEGORIES = [
  { key: "padel", label: "Padel", keys: ["padel"] },
  { key: "pickleball", label: "Pickleball", keys: ["pickleball"] },
  { key: "tennis", label: "Tennis", keys: ["tennis"] },
  { key: "running", label: "Running", keys: ["running"] },
  { key: "badminton", label: "Badminton", keys: ["badminton"] },
  { key: "social_party", label: "Social", keys: ["social", "party", "social_party"] },
  { key: "coffee_gathering", label: "Coffee Gathering", keys: ["coffee_gathering"] },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const supabase = createClient();

  // Compute "now" in Bangkok time (UTC+7) regardless of what timezone the
  // server itself runs in, since that's the timezone all your events are in.
  const nowBangkok = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const today = nowBangkok.toISOString().slice(0, 10); // YYYY-MM-DD
  const nowBangkokStamp = nowBangkok.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM, sorts chronologically as a string

  const { data: rawEvents } = await supabase
    .from("events")
    .select("*")
    // Coarse filter: definitely-past calendar days are always excluded,
    // regardless of end time. Events without a date set (event_date is
    // null) are kept visible so nothing vanishes by accident.
    .or(`event_date.is.null,event_date.gte.${today}`)
    .order("event_date", { ascending: true, nullsFirst: false });

  // Fine filter: for events happening TODAY, also hide them once their
  // actual end time has passed (falls back to end-of-day if no end time
  // was set, so this is a no-op for events without one).
  const allEvents = rawEvents?.filter((ev) => {
    if (!ev.event_date) return true;
    const eventEndStamp = `${ev.event_date}T${ev.end_time ? ev.end_time.slice(0, 5) : "23:59"}`;
    return eventEndStamp >= nowBangkokStamp;
  });

  // Count confirmed tickets per event, so ticket cards can show "X spots
  // left" for events with a capacity set. Only counts bookings made
  // through this website's own Join & Pay flow. Uses the admin client
  // because RLS otherwise blocks public reads of the tickets table
  // entirely — only the counts are used below, never the raw rows.
  const admin = createAdminClient();
  const { data: ticketRows } = await admin
    .from("tickets")
    .select("event_id, status")
    .in("status", ["paid", "free_confirmed"]);
  const bookedCounts: Record<string, number> = {};
  ticketRows?.forEach((t) => {
    bookedCounts[t.event_id] = (bookedCounts[t.event_id] || 0) + 1;
  });

  const activeCategory = searchParams.category;
  const activeGroup = CATEGORIES.find((c) => c.key === activeCategory);
  const query = (searchParams.q || "").toLowerCase().trim();

  let events = activeGroup
    ? allEvents?.filter((ev) => activeGroup.keys.includes(ev.category))
    : allEvents;

  if (query) {
    events = events?.filter((ev) =>
      `${ev.title} ${ev.location} ${ev.details}`.toLowerCase().includes(query)
    );
  }

  return (
    <>
      <div className="hero hero-centered">
        <div className="wrap">
          <h1 className="hero-headline">
            Find what's on <span className="hero-accent">tonight.</span>
          </h1>
          <p className="hero-sub">
            Padel, pickleball, tennis, running and social meetups — curated across the whole country.
          </p>
          <form action="/" method="GET" className="hero-search-minimal hero-search-centered">
            <Search size={18} className="hero-search-minimal-icon" />
            <input type="text" name="q" placeholder="Search events" defaultValue={query} />
            <button type="submit" aria-label="Search">
              <Search size={16} />
            </button>
          </form>
        </div>
      </div>

      <main className="wrap section">
        <span className="cat" style={{ display: "block", marginBottom: 8 }}>This week</span>
        <div id="browse" className="filter-row">
          <a href="/" className={`filter-pill ${!activeCategory ? "active" : ""}`}>All</a>
          {CATEGORIES.map((c) => (
            <a
              key={c.key}
              href={`/?category=${c.key}`}
              className={`filter-pill ${activeCategory === c.key ? "active" : ""}`}
            >
              {c.label}
            </a>
          ))}
        </div>

        {(!events || events.length === 0) && (
          <p style={{ color: "var(--ink-soft)" }}>
            {activeCategory ? "No events in this category yet — check back soon." : "No events listed yet — check back soon."}
          </p>
        )}

        <div className="grid">
          {events?.map((ev) => {
            const booked = bookedCounts[ev.id] || 0;
            const spotsLeft = ev.capacity != null ? Math.max(ev.capacity - booked, 0) : null;
            return (
              <a key={ev.id} className="ticket" href={`/events/${ev.id}`}>
                <div
                  className={`ticket-photo ${!ev.image_url ? "ticket-photo-empty" : ""}`}
                  style={ev.image_url ? { backgroundImage: `url(${ev.image_url})` } : undefined}
                >
                  <div className="ticket-date">
                    <span className="day">{ev.day}</span>
                    <span className="month">{ev.month}</span>
                  </div>
                  <div className="ticket-cat-overlay">
                    <span className={`ticket-cat ticket-cat-${ev.category}`}>{ev.category}</span>
                  </div>
                </div>
                <div className="ticket-body">
                  <h3>{ev.title}</h3>
                  <p className="meta">{ev.location}{ev.start_time ? ` · ${formatTime(ev.start_time)}` : ""}</p>
                  <p className="meta">{ev.details}</p>
                  {spotsLeft !== null && (
                    <p className={`meta spots-left ${spotsLeft === 0 ? "spots-full" : ""}`}>
                      {spotsLeft === 0 ? "Sold out" : `${spotsLeft} of ${ev.capacity} spots left`}
                    </p>
                  )}
                  <div className="ticket-foot">
                    <span className="ticket-price">
                      {Number(ev.price_baht) === 0 ? "Free" : `฿${Number(ev.price_baht).toFixed(0)}`}
                    </span>
                    <span className="ticket-details">Details →</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div style={{ marginTop: 72 }}>
          <span className="cat" style={{ display: "block", marginBottom: 8 }}>Browse</span>
          <h2 style={{ marginBottom: 28 }}>Find your kind of night</h2>
          <div className="category-grid">
            {CATEGORIES.map((c) => (
              <a
                key={c.key}
                href={`/?category=${c.key}`}
                className="category-tile"
                style={{ backgroundImage: `url(/categories/${c.key}.jpg)` }}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
