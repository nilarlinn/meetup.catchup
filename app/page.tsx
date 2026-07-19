import { createClient } from "@/lib/supabase-server";
import { CalendarDays } from "lucide-react";

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
  searchParams: { category?: string };
}) {
  const supabase = createClient();
  const { data: allEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const activeCategory = searchParams.category;
  const events = activeCategory
    ? allEvents?.filter((ev) => ev.category === activeCategory)
    : allEvents;

  return (
    <>
      <div className="hero">
        <div className="wrap">
          <h1>Find what's on</h1>
          <p>Padel, pickleball, tennis, running, badminton and social meetups across Bangkok.</p>
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
            <a key={ev.id} className="card" href={`/events/${ev.id}`}>
              <div
                className="card-image"
                style={ev.image_url ? { backgroundImage: `url(${ev.image_url})` } : undefined}
              >
                <span className="cat-badge">{ev.category}</span>
              </div>
              <div className="card-body">
                <h3>{ev.title}</h3>
                <p className="meta meta-row"><CalendarDays size={14} /> {ev.day} {ev.month} · {ev.location}</p>
                <p className="meta">{ev.details}</p>
                <p className="price">
                  {Number(ev.price_baht) === 0 ? "Free" : `฿${Number(ev.price_baht).toFixed(0)}`}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 56 }}>
          <span className="cat" style={{ display: "block", marginBottom: 6 }}>Browse</span>
          <h2 style={{ marginBottom: 20 }}>Find your kind of night</h2>
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
