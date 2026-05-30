// Stripe SDK + price-ID registry.
// Uses the fetch HTTP client (required for Cloudflare Workers).
import Stripe from "stripe";

/** Returns true only when real Stripe keys are present (not dummy placeholders). */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return (
    (key.startsWith("sk_test_") || key.startsWith("sk_live_")) &&
    !key.includes("dummy") &&
    !key.includes("placeholder")
  );
}

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient()
  });
}

export type PlanId = "starter" | "growth" | "scale";

export const PRICE_IDS: Readonly<Record<PlanId, { sub: string; setup: string; tokens: number }>> = {
  starter: { sub: process.env.STRIPE_PRICE_STARTER ?? "", setup: process.env.STRIPE_PRICE_SETUP ?? "", tokens: 500_000 },
  growth:  { sub: process.env.STRIPE_PRICE_GROWTH  ?? "", setup: process.env.STRIPE_PRICE_SETUP ?? "", tokens: 2_000_000 },
  scale:   { sub: process.env.STRIPE_PRICE_SCALE   ?? "", setup: process.env.STRIPE_PRICE_SETUP ?? "", tokens: 8_000_000 }
};

export const TOPUP_TOKENS = 200_000;
export const TOPUP_PRICE_ID = process.env.STRIPE_PRICE_TOPUP ?? "";
