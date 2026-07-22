import { createClient } from "@/lib/supabase-server";

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
  const { data: allEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

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
          <form action="/" method="GET" className="hero-search hero-search-centered">
            <div className="hero-search-input-wrap">
              <img src="/logo-icon-transparent.png" alt="" className="hero-search-icon" />
              <input type="text" name="q" placeholder="Search events" defaultValue={query} />
            </div>
            <button type="submit" className="btn">Search</button>
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
          {events?.map((ev) => (
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
                <p className="meta">{ev.location}</p>
                <p className="meta">{ev.details}</p>
                <div className="ticket-foot">
                  <span className="ticket-price">
                    {Number(ev.price_baht) === 0 ? "Free" : `฿${Number(ev.price_baht).toFixed(0)}`}
                  </span>
                  <span className="ticket-details">Details →</span>
                </div>
              </div>
            </a>
          ))}
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
