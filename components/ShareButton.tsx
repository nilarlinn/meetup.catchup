"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    // On phones, this opens the native share sheet — Instagram Stories,
    // WhatsApp, Messages, etc. all show up there automatically.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // Person cancelled the share sheet — nothing to do.
      }
      return;
    }

    // Desktop browsers mostly don't support navigator.share — copy the
    // link instead so they can paste it wherever they want.
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; nothing more we can do here.
    }
  }

  return (
    <button type="button" onClick={handleShare} className="btn ghost share-btn">
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
