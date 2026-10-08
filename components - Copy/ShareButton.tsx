"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export default function ShareButton({
  title,
  url,
  imageUrl,
}: {
  title: string;
  url: string;
  imageUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      // Try sharing the event photo as an actual image file, not just a
      // link. Instagram's "Add to Story" only shows up as a share option
      // when there's an image to share — a plain link mostly only offers
      // Direct Message / WhatsApp / Messages. This mainly works on
      // Android; iOS support for file sharing varies by version.
      if (imageUrl && navigator.canShare) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "event.jpg", { type: blob.type || "image/jpeg" });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ title, text: `${title} — ${url}`, files: [file] });
            return;
          }
        } catch {
          // Image fetch/share failed — fall through to the link-only share below.
        }
      }

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
