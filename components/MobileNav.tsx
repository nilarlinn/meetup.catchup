"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav-wrap">
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className="desktop-nav">{children}</nav>

      {open && (
        <nav className="mobile-nav-panel" onClick={() => setOpen(false)}>
          {children}
        </nav>
      )}
    </div>
  );
}
