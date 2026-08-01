"use client";

import { useState } from "react";
import { CreditCard, QrCode } from "lucide-react";

export default function PaymentOptions({
  cardForm,
  qrForm,
  hasQR,
}: {
  cardForm: React.ReactNode;
  qrForm: React.ReactNode;
  hasQR: boolean;
}) {
  const [tab, setTab] = useState<"card" | "qr">("card");

  if (!hasQR) return <>{cardForm}</>;

  return (
    <div>
      <div className="pay-tabs">
        <button
          type="button"
          className={`pay-tab ${tab === "card" ? "active" : ""}`}
          onClick={() => setTab("card")}
        >
          <CreditCard size={15} /> Card / Stripe QR
        </button>
        <button
          type="button"
          className={`pay-tab ${tab === "qr" ? "active" : ""}`}
          onClick={() => setTab("qr")}
        >
          <QrCode size={15} /> Direct Thai QR
        </button>
      </div>
      {tab === "card" ? cardForm : qrForm}
    </div>
  );
}
