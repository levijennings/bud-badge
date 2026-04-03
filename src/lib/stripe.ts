import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    interval: 'month' as const,
    features: ['Up to 10 employees', 'Basic training modules', 'Compliance tracking', 'Email support'],
  },
  professional: {
    name: 'Professional',
    price: 149,
    interval: 'month' as const,
    features: ['Up to 50 employees', 'Custom training paths', 'Advanced analytics', 'Priority support', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Custom pricing
    interval: 'month' as const,
    features: ['Unlimited employees', 'White-label options', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
  },
} as const
