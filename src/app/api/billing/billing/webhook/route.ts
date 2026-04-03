/**
 * Bud Badge Billing API - Webhook Handler
 * POST /api/billing/webhook
 *
 * Receives and processes Stripe webhook events
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  logBillingEvent,
} from "@/lib/stripe/webhooks";

// These callbacks would be implemented in your database/service layer
const webhookCallbacks = {
  onSubscriptionCreated: async (customerId: string, subscription: any) => {
    // TODO: Update user subscription in database
    console.log(`Subscription created for customer ${customerId}:`, subscription);
  },

  onMetadataUpdated: async (customerId: string, metadata: Record<string, any>) => {
    // TODO: Update customer metadata
    console.log(`Metadata updated for customer ${customerId}:`, metadata);
  },

  onSubscriptionUpdated: async (subscription: any) => {
    // TODO: Update subscription in database
    console.log(`Subscription updated:`, subscription);
  },

  onPlanChanged: async (customerId: string, oldPriceId: string, newPriceId: string) => {
    // TODO: Log plan change event
    console.log(`Plan changed for customer ${customerId}: ${oldPriceId} -> ${newPriceId}`);
  },

  onCancellationScheduled: async (customerId: string, cancelAt: Date) => {
    // TODO: Update subscription with cancellation date
    console.log(`Cancellation scheduled for customer ${customerId} at ${cancelAt}`);
  },

  onSubscriptionCanceled: async (customerId: string, subscriptionId: string) => {
    // TODO: Mark subscription as canceled
    console.log(`Subscription canceled: ${subscriptionId} for customer ${customerId}`);
  },

  onPaymentSucceeded: async (invoice: any) => {
    // TODO: Log successful payment
    console.log(`Payment succeeded for invoice ${invoice.id}`);
  },

  onPaymentFailed: async (invoice: any, retryAfter?: Date) => {
    // TODO: Log failed payment and send notification
    console.log(`Payment failed for invoice ${invoice.id}, retry after ${retryAfter}`);
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const event = await verifyWebhookSignature(body, signature, secret);
    if (!event) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    console.log(`Received webhook event: ${event.type}`);

    // Route event to appropriate handler
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event, {
          onSubscriptionCreated: webhookCallbacks.onSubscriptionCreated,
          onMetadataUpdated: webhookCallbacks.onMetadataUpdated,
        });
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event, {
          onSubscriptionUpdated: webhookCallbacks.onSubscriptionUpdated,
          onPlanChanged: webhookCallbacks.onPlanChanged,
          onCancellationScheduled: webhookCallbacks.onCancellationScheduled,
        });
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event, {
          onSubscriptionCanceled: webhookCallbacks.onSubscriptionCanceled,
        });
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event, {
          onPaymentSucceeded: webhookCallbacks.onPaymentSucceeded,
        });
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event, {
          onPaymentFailed: webhookCallbacks.onPaymentFailed,
        });
        break;

      case "invoice.created":
      case "invoice.payment_action_required":
      case "invoice.updated":
        // Log these but don't necessarily process
        console.log(`Event ${event.type} received and logged`);
        break;

      default:
        console.warn(`Unhandled webhook event type: ${event.type}`);
    }

    // Log event for audit trail (if available in callbacks)
    const customerId = (event.data.object as any)?.customer;
    if (customerId) {
      const subscriptionId = (event.data.object as any)?.subscription;
      await logBillingEvent(event, customerId, subscriptionId);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
