import "./globals.css";
import { CalendarDays, PlusCircle, Info, Instagram, Mail } from "lucide-react";
import { CONTACT } from "@/lib/contact";

export const metadata = {
  title: "Meetup Catch Up | Thailand Events",
  description: "Padel, pickleball, tennis, running and social meetups.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site">
          <div className="wrap">
            <a className="brand-block" href="/">
              <img src="/logo.png" alt="Meetup Catch Up" className="brand-logo" />
              <span>
                <span className="brand">Meetup Catch Up</span>
                <span className="brand-sub">Bangkok Sports &amp; Social</span>
              </span>
            </a>
            <nav>
              <a href="/" className="nav-link">
                <CalendarDays size={16} />
                Events
              </a>
              <a href="/about" className="nav-link">
                <Info size={16} />
                About
              </a>
              <a href="/submit" className="nav-link">
                <PlusCircle size={16} />
                List your event
              </a>
            </nav>
          </div>
        </header>

        {children}

        <footer className="site-footer">
          <div className="wrap footer-grid">
            <div>
              <a className="brand" href="/" style={{ color: "white" }}>Meetup Catch Up</a>
              <p className="footer-tagline">
                Padel, pickleball, tennis, running and social meetups — all in one place.
              </p>
            </div>
            <div>
              <h4>Explore</h4>
              <a href="/">Events</a>
              <a href="/about">About</a>
              <a href="/submit">List your event</a>
            </div>
            <div>
              <h4>Connect</h4>
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="nav-link">
                <Instagram size={16} /> Instagram
              </a>
              <a href={`mailto:${CONTACT.email}`} className="nav-link">
                <Mail size={16} /> Email
              </a>
            </div>
          </div>
          <div className="wrap footer-bottom">
            <span>© {new Date().getFullYear()} Meetup Catch Up. All rights reserved.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
