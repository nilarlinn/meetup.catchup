"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

export default function HeroSearch({
  defaultQuery,
  variant = "hero",
}: {
  defaultQuery: string;
  variant?: "hero" | "header";
}) {
  const [open, setOpen] = useState(!!defaultQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search events"
        className={variant === "header" ? "header-search-icon-toggle" : "hero-search-icon-toggle"}
      >
        <Search size={variant === "header" ? 18 : 20} />
      </button>
    );
  }

  return (
    <form
      action="/"
      method="GET"
      className={
        variant === "header"
          ? "hero-search-minimal header-search-dropdown"
          : "hero-search-minimal hero-search-centered"
      }
    >
      <Search size={18} className="hero-search-minimal-icon" />
      <input ref={inputRef} type="text" name="q" placeholder="Search events" defaultValue={defaultQuery} />
      <button type="submit" aria-label="Search">
        <Search size={16} />
      </button>
    </form>
  );
}
