import { submitEvent } from "./actions";

export default function SubmitPage() {
  return (
    <main className="wrap section" style={{ maxWidth: 560 }}>
      <h1>List your event</h1>
      <p style={{ color: "var(--ink-soft)" }}>
        Send us the details — we review every submission before it goes live.
      </p>

      <form action={submitEvent} style={{ marginTop: 20 }}>
        <div className="form-row">
          <label>Your name</label>
          <input name="name" placeholder="Jane Doe" />
        </div>
        <div className="form-row">
          <label>Contact (email, phone, or Line)</label>
          <input name="contact" required placeholder="you@email.com" />
        </div>
        <div className="form-row">
          <label>Event title</label>
          <input name="title" required placeholder="Sunday Padel Social" />
        </div>
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
        <div className="form-row">
          <label>Price in THB (0 for free)</label>
          <input name="price" type="number" step="0.01" min="0" defaultValue="0" />
        </div>
        <div className="form-row">
          <label>Day</label>
          <input name="day" placeholder="26" />
        </div>
        <div className="form-row">
          <label>Month</label>
          <input name="month" placeholder="Jul" />
        </div>
        <div className="form-row">
          <label>Location / time</label>
          <input name="location" placeholder="e.g. venue name · 7:00 PM" />
        </div>
        <div className="form-row">
          <label>Extra details</label>
          <input name="details" placeholder="Format, skill level, what to bring..." />
        </div>
        <div className="form-row">
          <label>Photo URL (optional)</label>
          <input name="image_url" placeholder="https://..." />
        </div>
        <div className="form-row">
          <label>Description</label>
          <textarea name="description" placeholder="Tell people what to expect..." />
        </div>
        <button className="btn" type="submit">Submit for review</button>
      </form>
    </main>
  );
}
