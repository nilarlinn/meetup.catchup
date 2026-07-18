import { Resend } from "resend";

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
