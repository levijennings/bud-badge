/**
 * Bud Badge Billing API - Checkout Session
 * POST /api/billing/checkout
 *
 * Creates a Stripe Checkout session for the selected plan
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const checkoutRequestSchema = z.object({
  priceId: z.string().min(1, "Price ID is required"),
  customerId: z.string().optional(),
  email: z.string().email("Valid email required"),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
  metadata: z.record(z.string()).optional(),
});

type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutRequestSchema.parse(body);

    // Get origin for success/cancel URLs
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

    // Get or create customer
    let customerId = parsed.customerId;

    if (!customerId) {
      const existingCustomers = await stripe.customers.list({
        email: parsed.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: parsed.email,
          metadata: {
            app: "bud-badge",
            ...parsed.metadata,
          },
        });
        customerId = customer.id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: parsed.priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing?cancelled=true`,
      metadata: {
        app: "bud-badge",
        billingCycle: parsed.billingCycle,
        ...parsed.metadata,
      },
      billing_address_collection: "required",
      subscription_data: {
        metadata: {
          app: "bud-badge",
          billingCycle: parsed.billingCycle,
        },
      },
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
        customerId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Checkout error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
