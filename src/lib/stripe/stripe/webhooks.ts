/**
 * Bud Badge Stripe Webhooks
 * Handles all Stripe events and updates database
 */

import { StripeWebhookEvent, Subscription, Invoice, BillingEvent } from "@/lib/stripe/types";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<StripeWebhookEvent | null> {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    return event as unknown as StripeWebhookEvent;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}

/**
 * Handle checkout.session.completed event
 * Customer successfully completed checkout
 */
export async function handleCheckoutSessionCompleted(
  event: StripeWebhookEvent,
  callbacks: {
    onSubscriptionCreated?: (customerId: string, subscription: Subscription) => Promise<void>;
    onMetadataUpdated?: (customerId: string, metadata: Record<string, any>) => Promise<void>;
  }
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  if (!session.customer || !session.subscription) {
    console.warn("Checkout session missing customer or subscription", session.id);
    return;
  }

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer.id;

  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription.id;

  try {
    // Fetch full subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const mappedSubscription: Subscription = {
      id: subscription.id,
      customerId,
      priceId: subscription.items.data[0]?.price.id || "",
      productId: subscription.items.data[0]?.price.product as string || "",
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      metadata: subscription.metadata || undefined,
    };

    if (callbacks.onSubscriptionCreated) {
      await callbacks.onSubscriptionCreated(customerId, mappedSubscription);
    }

    // Update metadata
    if (callbacks.onMetadataUpdated && session.metadata) {
      await callbacks.onMetadataUpdated(customerId, session.metadata);
    }
  } catch (error) {
    console.error("Error processing checkout.session.completed:", error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 * Plan change, billing information update, etc.
 */
export async function handleSubscriptionUpdated(
  event: StripeWebhookEvent,
  callbacks: {
    onSubscriptionUpdated?: (subscription: Subscription) => Promise<void>;
    onPlanChanged?: (customerId: string, oldPriceId: string, newPriceId: string) => Promise<void>;
    onCancellationScheduled?: (customerId: string, cancelAt: Date) => Promise<void>;
  }
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const previous = event.data.previous_attributes;

  try {
    const mappedSubscription: Subscription = {
      id: subscription.id,
      customerId: subscription.customer as string,
      priceId: subscription.items.data[0]?.price.id || "",
      productId: subscription.items.data[0]?.price.product as string || "",
      status: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      endedAt: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
      trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      metadata: subscription.metadata || undefined,
    };

    if (callbacks.onSubscriptionUpdated) {
      await callbacks.onSubscriptionUpdated(mappedSubscription);
    }

    // Check if plan changed
    if (previous?.items) {
      const oldPriceId = previous.items.data[0]?.price.id;
      const newPriceId = subscription.items.data[0]?.price.id;
      if (oldPriceId && newPriceId && oldPriceId !== newPriceId && callbacks.onPlanChanged) {
        await callbacks.onPlanChanged(subscription.customer as string, oldPriceId, newPriceId);
      }
    }

    // Check if cancellation was scheduled
    if (!previous?.cancel_at && subscription.cancel_at && callbacks.onCancellationScheduled) {
      await callbacks.onCancellationScheduled(
        subscription.customer as string,
        new Date(subscription.cancel_at * 1000)
      );
    }
  } catch (error) {
    console.error("Error processing customer.subscription.updated:", error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 * Subscription was canceled
 */
export async function handleSubscriptionDeleted(
  event: StripeWebhookEvent,
  callbacks: {
    onSubscriptionCanceled?: (customerId: string, subscriptionId: string) => Promise<void>;
  }
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;

  try {
    if (callbacks.onSubscriptionCanceled) {
      await callbacks.onSubscriptionCanceled(
        subscription.customer as string,
        subscription.id
      );
    }
  } catch (error) {
    console.error("Error processing customer.subscription.deleted:", error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 * Payment was successfully processed
 */
export async function handleInvoicePaymentSucceeded(
  event: StripeWebhookEvent,
  callbacks: {
    onPaymentSucceeded?: (invoice: Invoice) => Promise<void>;
  }
): Promise<void> {
  const stripeInvoice = event.data.object as Stripe.Invoice;

  try {
    const invoice: Invoice = {
      id: stripeInvoice.id,
      number: stripeInvoice.number || "",
      customerId: stripeInvoice.customer as string,
      subscriptionId: typeof stripeInvoice.subscription === "string"
        ? stripeInvoice.subscription
        : (stripeInvoice.subscription?.id || ""),
      amount: stripeInvoice.amount_paid,
      currency: stripeInvoice.currency,
      status: stripeInvoice.status as any,
      description: stripeInvoice.description || undefined,
      pdfUrl: stripeInvoice.invoice_pdf || "",
      createdAt: new Date(stripeInvoice.created * 1000),
      dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : null,
      paidAt: stripeInvoice.paid_at ? new Date(stripeInvoice.paid_at * 1000) : null,
      attemptCount: stripeInvoice.attempt_count || 0,
      nextAttemptDate: stripeInvoice.next_payment_attempt
        ? new Date(stripeInvoice.next_payment_attempt * 1000)
        : null,
      metadata: stripeInvoice.metadata || undefined,
    };

    if (callbacks.onPaymentSucceeded) {
      await callbacks.onPaymentSucceeded(invoice);
    }
  } catch (error) {
    console.error("Error processing invoice.payment_succeeded:", error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 * Payment attempt failed
 */
export async function handleInvoicePaymentFailed(
  event: StripeWebhookEvent,
  callbacks: {
    onPaymentFailed?: (invoice: Invoice, retryAfter?: Date) => Promise<void>;
  }
): Promise<void> {
  const stripeInvoice = event.data.object as Stripe.Invoice;

  try {
    const invoice: Invoice = {
      id: stripeInvoice.id,
      number: stripeInvoice.number || "",
      customerId: stripeInvoice.customer as string,
      subscriptionId: typeof stripeInvoice.subscription === "string"
        ? stripeInvoice.subscription
        : (stripeInvoice.subscription?.id || ""),
      amount: stripeInvoice.amount_due,
      currency: stripeInvoice.currency,
      status: stripeInvoice.status as any,
      description: stripeInvoice.description || undefined,
      pdfUrl: stripeInvoice.invoice_pdf || "",
      createdAt: new Date(stripeInvoice.created * 1000),
      dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : null,
      paidAt: null,
      attemptCount: stripeInvoice.attempt_count || 0,
      nextAttemptDate: stripeInvoice.next_payment_attempt
        ? new Date(stripeInvoice.next_payment_attempt * 1000)
        : null,
      metadata: stripeInvoice.metadata || undefined,
    };

    if (callbacks.onPaymentFailed) {
      await callbacks.onPaymentFailed(
        invoice,
        stripeInvoice.next_payment_attempt
          ? new Date(stripeInvoice.next_payment_attempt * 1000)
          : undefined
      );
    }
  } catch (error) {
    console.error("Error processing invoice.payment_failed:", error);
    throw error;
  }
}

/**
 * Log billing event for audit trail
 */
export async function logBillingEvent(
  event: StripeWebhookEvent,
  customerId: string,
  subscriptionId?: string
): Promise<BillingEvent> {
  const billingEvent: BillingEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
    customerId,
    subscriptionId,
    eventType: event.type as any,
    stripeEventId: event.id,
    data: event.data.object,
    processedAt: new Date(),
    createdAt: new Date(event.created * 1000),
  };

  // In production, save to database
  console.log("Billing event:", billingEvent);

  return billingEvent;
}
