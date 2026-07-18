import { createClient } from "@/lib/supabase-server";

export const revalidate = 0; // always fetch fresh

export default async function HomePage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="wrap section">
      <h1>Find what's on</h1>
      <p style={{ color: "var(--ink-soft)" }}>
        Padel, pickleball, tennis, running and social meetups.
      </p>

      {(!events || events.length === 0) && (
        <p>No events listed yet — check back soon.</p>
      )}

      <div className="grid" style={{ marginTop: 24 }}>
        {events?.map((ev) => (
          <a key={ev.id} className="card" href={`/events/${ev.id}`}>
            <span className="cat">{ev.category}</span>
            <h3>{ev.title}</h3>
            <p className="meta">{ev.day} {ev.month} · {ev.location}</p>
            <p className="meta">{ev.details}</p>
            <p className="price">
              {Number(ev.price_baht) === 0 ? "Free" : `฿${Number(ev.price_baht).toFixed(0)}`}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
