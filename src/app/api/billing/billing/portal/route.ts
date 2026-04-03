/**
 * Bud Badge Billing API - Customer Portal
 * POST /api/billing/portal
 *
 * Creates a Stripe Customer Portal session for managing subscriptions
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

const portalRequestSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
});

type PortalRequest = z.infer<typeof portalRequestSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = portalRequestSchema.parse(body);

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL;

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: parsed.customerId,
      return_url: `${origin}/billing`,
      configuration: process.env.STRIPE_PORTAL_CONFIG_ID,
    });

    if (!session.url) {
      throw new Error("Failed to create portal session URL");
    }

    return NextResponse.json(
      {
        url: session.url,
        sessionId: session.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Portal error:", error);

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
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
