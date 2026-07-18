import "./globals.css";

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
            <a className="brand" href="/">Meetup Catch Up</a>
            <nav>
              <a href="/">Events</a>
              <a href="/submit">List your event</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
