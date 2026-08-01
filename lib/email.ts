import { Resend } from "resend";
import { CONTACT } from "./contact";

const resend = new Resend(process.env.RESEND_API_KEY);

// FROM_EMAIL: use Resend's shared test address until you verify your own
// domain in the Resend dashboard (see README). Once verified, set
// FROM_EMAIL to something like "Meetup Catch Up <events@yourdomain.com>".
const FROM_EMAIL = process.env.FROM_EMAIL || "Meetup Catch Up <onboarding@resend.dev>";

export async function sendTicketConfirmationEmail(params: {
  to: string;
  name: string;
  eventTitle: string;
  eventWhen: string;
  eventWhere: string;
  paid: boolean;
  priceLabel: string;
}) {
  const { to, name, eventTitle, eventWhen, eventWhere, paid, priceLabel } = params;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `You're confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #14152B;">You're in, ${name}! 🎉</h2>
          <p>Your spot for <strong>${eventTitle}</strong> is confirmed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 6px 0; color: #5B5142;">When</td><td style="padding: 6px 0;">${eventWhen}</td></tr>
            <tr><td style="padding: 6px 0; color: #5B5142;">Where</td><td style="padding: 6px 0;">${eventWhere}</td></tr>
            <tr><td style="padding: 6px 0; color: #5B5142;">Price</td><td style="padding: 6px 0;">${priceLabel}${paid ? " (paid)" : ""}</td></tr>
          </table>
          <p style="color: #5B5142; font-size: 13px;">See you there!</p>
        </div>
      `,
    });
  } catch (err) {
    // Never let an email failure break the join/payment flow — just log it.
    console.error("Failed to send confirmation email:", err);
  }
}

// Sent to the customer right after they claim to have paid via the
// organizer's own direct Thai QR (not through Stripe). This is NOT a
// confirmation — it just tells them their spot is being held while the
// organizer manually checks their bank account and confirms.
export async function sendPaymentPendingEmail(params: {
  to: string;
  name: string;
  eventTitle: string;
  eventWhen: string;
  eventWhere: string;
  priceLabel: string;
}) {
  const { to, name, eventTitle, eventWhen, eventWhere, priceLabel } = params;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `We got your payment notice: ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #14152B;">Thanks, ${name}!</h2>
          <p>We've noted that you paid <strong>${priceLabel}</strong> by QR transfer for <strong>${eventTitle}</strong>. Your spot is being held.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 6px 0; color: #5B5142;">When</td><td style="padding: 6px 0;">${eventWhen}</td></tr>
            <tr><td style="padding: 6px 0; color: #5B5142;">Where</td><td style="padding: 6px 0;">${eventWhere}</td></tr>
          </table>
          <p style="color: #5B5142; font-size: 13px;">We'll send a final confirmation once we've checked the payment came through — usually within a few hours.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send payment-pending email:", err);
  }
}

// Sent to the organizer whenever someone claims a direct-QR payment, so
// it doesn't get missed — check the bank app, then confirm in the admin
// dashboard.
export async function sendManualPaymentAlertEmail(params: {
  name: string;
  email: string;
  eventTitle: string;
  priceLabel: string;
}) {
  const { name, email, eventTitle, priceLabel } = params;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: CONTACT.email,
      subject: `Check your bank: ${name} says they paid for ${eventTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p><strong>${name}</strong> (${email}) says they paid <strong>${priceLabel}</strong> by direct QR for <strong>${eventTitle}</strong>.</p>
          <p>Check your bank app for the transfer, then confirm it in your admin dashboard's "Recent tickets" list.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send manual payment alert email:", err);
  }
}
