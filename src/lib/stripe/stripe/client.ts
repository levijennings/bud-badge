/**
 * Bud Badge Stripe Client
 * Client-side Stripe loader and configuration
 */

import { loadStripe, Stripe } from "@stripe/js";

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance (lazy loads)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

/**
 * Initialize Stripe for checkout
 */
export async function initializeCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error("Stripe failed to initialize");
  }
  return stripe.redirectToCheckout({ sessionId });
}

/**
 * Verify Stripe is available
 */
export async function isStripeAvailable(): Promise<boolean> {
  const stripe = await getStripe();
  return stripe !== null;
}
