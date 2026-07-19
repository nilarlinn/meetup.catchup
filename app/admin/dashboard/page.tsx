import { createAdminClient } from "@/lib/supabase-admin";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  approveSubmission,
  dismissSubmission,
  signOutAdmin,
} from "./actions";

export const revalidate = 0;

export default async function AdminDashboard() {
  // Middleware already confirmed this request comes from a logged-in,
  // allow-listed admin before this page is ever rendered.
  const admin = createAdminClient();

  const [{ data: events }, { data: submissions }, { data: tickets }] = await Promise.all([
    admin.from("events").select("*").order("created_at", { ascending: false }),
    admin.from("submissions").select("*").order("created_at", { ascending: false }),
    admin
      .from("tickets")
      .select("*, events(title)")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const pending = submissions?.filter((s) => s.status === "pending") || [];

  return (
    <main className="wrap section">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin dashboard</h1>
        <form action={signOutAdmin}>
          <button className="btn ghost" type="submit">Sign out</button>
        </form>
      </div>

      <h2>Pending submissions {pending.length ? `(${pending.length})` : ""}</h2>
      {pending.length === 0 && <p style={{ color: "var(--ink-soft)" }}>Nothing pending.</p>}
      {pending.map((s) => (
        <div key={s.id} className="card" style={{ marginBottom: 12 }}>
          <span className="badge pending">Pending</span>
          <h3>{s.title}</h3>
          <p className="meta">
            {s.category} · {s.day} {s.month} · {s.location} · ฿{Number(s.price_baht).toFixed(0)}
          </p>
          <p className="meta">From {s.submitter_name || "unknown"} — {s.contact}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <form action={approveSubmission.bind(null, s.id)}>
              <button className="btn" type="submit">Approve</button>
            </form>
            <form action={dismissSubmission.bind(null, s.id)}>
              <button className="btn ghost" type="submit">Dismiss</button>
            </form>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Add a new event</h2>
      <form action={createEvent} style={{ maxWidth: 480 }}>
        <div className="form-row"><label>Title</label><input name="title" required /></div>
        <div className="form-row">
          <label>Category</label>
          <select name="category" defaultValue="padel">
            <option value="padel">Padel</option>
            <option value="social">Social</option>
            <option value="pickleball">Pickleball</option>
            <option value="tennis">Tennis</option>
            <option value="running">Running</option>
            <option value="party">Party</option>
            <option value="badminton">Badminton</option>
          </select>
        </div>
        <div className="form-row"><label>Price in THB (0 for free)</label><input name="price" type="number" step="0.01" min="0" defaultValue="0" /></div>
        <div className="form-row"><label>Day</label><input name="day" placeholder="26" /></div>
        <div className="form-row"><label>Month</label><input name="month" placeholder="Jul" /></div>
        <div className="form-row"><label>Location / time</label><input name="location" /></div>
        <div className="form-row"><label>Extra details</label><input name="details" /></div>
        <div className="form-row">
          <label>Photo URL</label>
          <input name="image_url" placeholder="https://..." />
          <p className="hint">Paste a link to an image (from Unsplash, your own hosting, etc.) — optional.</p>
        </div>
        <div className="form-row"><label>Description</label><textarea name="description" /></div>
        <button className="btn" type="submit">Add event</button>
      </form>

      <h2 style={{ marginTop: 40 }}>All events</h2>
      <table className="admin">
        <thead>
          <tr><th>Title</th><th>Category</th><th>Date</th><th>Price</th><th></th></tr>
        </thead>
        <tbody>
          {events?.map((ev) => (
            <tr key={ev.id}>
              <td>
                <details>
                  <summary style={{ cursor: "pointer" }}>{ev.title}</summary>
                  <form action={updateEvent} style={{ maxWidth: 420, marginTop: 10 }}>
                    <input type="hidden" name="id" value={ev.id} />
                    <div className="form-row"><label>Title</label><input name="title" defaultValue={ev.title} required /></div>
                    <div className="form-row">
                      <label>Category</label>
                      <select name="category" defaultValue={ev.category}>
                        <option value="padel">Padel</option>
                        <option value="social">Social</option>
                        <option value="pickleball">Pickleball</option>
                        <option value="tennis">Tennis</option>
                        <option value="running">Running</option>
                        <option value="party">Party</option>
            <option value="badminton">Badminton</option>
                      </select>
                    </div>
                    <div className="form-row"><label>Price in THB</label><input name="price" type="number" step="0.01" min="0" defaultValue={ev.price_baht} /></div>
                    <div className="form-row"><label>Day</label><input name="day" defaultValue={ev.day} /></div>
                    <div className="form-row"><label>Month</label><input name="month" defaultValue={ev.month} /></div>
                    <div className="form-row"><label>Location / time</label><input name="location" defaultValue={ev.location} /></div>
                    <div className="form-row"><label>Extra details</label><input name="details" defaultValue={ev.details} /></div>
                    <div className="form-row"><label>Photo URL</label><input name="image_url" defaultValue={ev.image_url} placeholder="https://..." /></div>
                    <div className="form-row"><label>Description</label><textarea name="description" defaultValue={ev.description} /></div>
                    <button className="btn" type="submit">Save changes</button>
                  </form>
                </details>
              </td>
              <td>{ev.category}</td>
              <td>{ev.day} {ev.month}</td>
              <td>{Number(ev.price_baht) === 0 ? "Free" : `฿${Number(ev.price_baht).toFixed(0)}`}</td>
              <td>
                <form action={deleteEvent.bind(null, ev.id)}>
                  <button className="btn ghost" type="submit">Delete</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Recent tickets</h2>
      <table className="admin">
        <thead>
          <tr><th>Event</th><th>Name</th><th>Email</th><th>Status</th></tr>
        </thead>
        <tbody>
          {tickets?.map((t: any) => (
            <tr key={t.id}>
              <td>{t.events?.title || "—"}</td>
              <td>{t.name}</td>
              <td>{t.email}</td>
              <td>
                <span className={`badge ${t.status === "paid" || t.status === "free_confirmed" ? "paid" : "pending"}`}>
                  {t.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
