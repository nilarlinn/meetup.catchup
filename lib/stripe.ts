import Stripe from "stripe";

// Using the fetch-based HTTP client instead of Stripe's default Node
// networking. This avoids intermittent "StripeConnectionError" issues
// that can happen with Node's http module in serverless environments
// like Vercel — fetch is more reliable here.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});
