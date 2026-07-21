import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

export const revalidate = 0;

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  free_confirmed: "Confirmed",
  pending: "Pending payment",
  cancelled: "Cancelled",
};

export default async function AccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tickets } = await supabase
    .from("tickets")
    .select("*, events(*)")
    .eq("email", user!.email)
    .order("created_at", { ascending: false });

  return (
    <main className="wrap section">
      <h1>My tickets</h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 32 }}>
        Signed in as {user!.email}
      </p>

      {(!tickets || tickets.length === 0) && (
        <p style={{ color: "var(--ink-soft)" }}>
          No tickets yet — once you book an event with this email, it'll show up here.
        </p>
      )}

      <div className="grid">
        {tickets?.map((t: any) => (
          <a key={t.id} className="ticket" href={t.events ? `/events/${t.events.id}` : "#"}>
            <div
              className={`ticket-photo ${!t.events?.image_url ? "ticket-photo-empty" : ""}`}
              style={t.events?.image_url ? { backgroundImage: `url(${t.events.image_url})` } : undefined}
            >
              <div className="ticket-date">
                <span className="day">{t.events?.day ?? "—"}</span>
                <span className="month">{t.events?.month ?? ""}</span>
              </div>
              <div className="ticket-cat-overlay">
                <span className="ticket-cat" style={{ background: "white", color: "var(--charcoal)" }}>
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
            </div>
            <div className="ticket-body">
              <h3>{t.events?.title ?? "Event no longer listed"}</h3>
              <p className="meta">{t.events?.location}</p>
              <div className="ticket-foot">
                <span className="ticket-price">{t.name}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
