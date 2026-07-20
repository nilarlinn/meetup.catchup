import { createClient } from "@/lib/supabase-server";

export const revalidate = 0; // always fetch fresh

const CATEGORIES = [
  { key: "padel", label: "Padel" },
  { key: "pickleball", label: "Pickleball" },
  { key: "tennis", label: "Tennis" },
  { key: "running", label: "Running" },
  { key: "badminton", label: "Badminton" },
  { key: "social", label: "Social" },
  { key: "party", label: "Party" },
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
  const query = (searchParams.q || "").toLowerCase().trim();

  let events = activeCategory
    ? allEvents?.filter((ev) => ev.category === activeCategory)
    : allEvents;

  if (query) {
    events = events?.filter((ev) =>
      `${ev.title} ${ev.location} ${ev.details}`.toLowerCase().includes(query)
    );
  }

  return (
    <>
      <div className="hero">
        <div className="wrap hero-flex">
          <div className="hero-text">
            <span style={{ color: "var(--gold)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>Bangkok</span>
            <h1 style={{ marginTop: 10 }}>Find what's on tonight.</h1>
            <p style={{ marginBottom: 28 }}>A curated list of padel, pickleball, tennis, running, badminton and social meetups.</p>
            <form action="/" method="GET" className="hero-search">
              <input type="text" name="q" placeholder="Search events" defaultValue={query} />
              <button type="submit" className="btn">Search</button>
            </form>
          </div>
          <div className="hero-logo-card">
            <img src="/logo.png" alt="Meetup Catch Up" className="hero-logo" />
          </div>
        </div>
      </div>

      <main className="wrap section">
        <div className="filter-row">
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
              <div className="ticket-date">
                <span className="day">{ev.day}</span>
                <span className="month">{ev.month}</span>
              </div>
              <div className="ticket-body">
                <span className={`ticket-cat ticket-cat-${ev.category}`}>{ev.category}</span>
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
