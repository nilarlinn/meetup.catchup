import { Instagram, Mail } from "lucide-react";
import { CONTACT } from "@/lib/contact";

export default function AboutPage() {
  return (
    <main className="wrap section" style={{ maxWidth: 640 }}>
      <span className="cat" style={{ display: "block", marginBottom: 6 }}>About us</span>
      <h1>Every court, every catch-up, one list</h1>
      <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.7 }}>
        Meetup Catch Up brings together padel, pickleball, tennis, running, badminton and social
        meetups across Bangkok — so you always know what's on and where to show up.
      </p>
      <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: "var(--ink-soft)" }}>
        Every event listed here is reviewed by our team before it goes live, so you can trust
        what you're joining.
      </p>

      <div style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 32 }}>
        <h2 style={{ marginBottom: 8 }}>Want to list your event?</h2>
        <p style={{ fontSize: 15, color: "var(--ink-soft)", marginBottom: 20 }}>
          Reach out to us directly and we'll help get it listed.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="btn ghost" style={{ justifyContent: "flex-start" }}>
            <Instagram size={16} /> Instagram
          </a>
          <a href={`mailto:${CONTACT.email}`} className="btn ghost" style={{ justifyContent: "flex-start" }}>
            <Mail size={16} /> {CONTACT.email}
          </a>
        </div>
      </div>
    </main>
  );
}
