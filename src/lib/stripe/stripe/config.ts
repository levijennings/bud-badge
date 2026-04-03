/**
 * Bud Badge Stripe Configuration
 * Plans, pricing, features, and plan limits
 */

import { Plan, PlanFeature, PlanTier } from "@/lib/stripe/types";

export const BUD_BADGE_PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for small teams getting started",
    tier: "starter",
    app: "bud-badge",
    monthlyPrice: 4900, // $49/month
    annualPrice: 49900, // $499/year
    currency: "USD",
    billingCycle: "monthly",
    stripeProductId: "", // Set via environment or setup script
    stripePriceIds: {
      monthly: "", // Set via environment
      annual: "", // Set via environment
    },
    features: [
      {
        id: "employees",
        name: "Team Members",
        description: "Up to 25 employees",
        included: true,
        limit: 25,
      },
      {
        id: "training_modules",
        name: "Training Modules",
        description: "5 pre-built modules",
        included: true,
        limit: 5,
      },
      {
        id: "basic_dashboard",
        name: "Compliance Dashboard",
        description: "Basic compliance tracking",
        included: true,
      },
      {
        id: "reporting",
        name: "Reporting",
        description: "Basic reports and exports",
        included: true,
      },
      {
        id: "user_management",
        name: "User Management",
        description: "Role-based access control",
        included: true,
      },
      {
        id: "analytics",
        name: "Advanced Analytics",
        description: "Team performance analytics",
        included: false,
      },
      {
        id: "priority_support",
        name: "Priority Support",
        description: "Email support only",
        included: false,
      },
      {
        id: "api_access",
        name: "API Access",
        description: "REST API integration",
        included: false,
      },
      {
        id: "sso",
        name: "Single Sign-On (SSO)",
        description: "Enterprise SSO support",
        included: false,
      },
      {
        id: "custom_modules",
        name: "Custom Modules",
        description: "Create custom training content",
        included: false,
      },
    ],
    limits: {
      maxEmployees: 25,
      maxModules: 5,
    },
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing organizations",
    tier: "professional",
    app: "bud-badge",
    monthlyPrice: 14900, // $149/month
    annualPrice: 149900, // $1,499/year
    currency: "USD",
    billingCycle: "monthly",
    popular: true,
    stripeProductId: "",
    stripePriceIds: {
      monthly: "",
      annual: "",
    },
    features: [
      {
        id: "employees",
        name: "Team Members",
        description: "Up to 100 employees",
        included: true,
        limit: 100,
      },
      {
        id: "training_modules",
        name: "Training Modules",
        description: "Unlimited modules",
        included: true,
      },
      {
        id: "basic_dashboard",
        name: "Compliance Dashboard",
        description: "Advanced compliance tracking",
        included: true,
      },
      {
        id: "reporting",
        name: "Reporting",
        description: "Advanced reports and analytics",
        included: true,
      },
      {
        id: "user_management",
        name: "User Management",
        description: "Advanced role & permission management",
        included: true,
      },
      {
        id: "analytics",
        name: "Advanced Analytics",
        description: "Deep team & individual analytics",
        included: true,
      },
      {
        id: "priority_support",
        name: "Priority Support",
        description: "Email & phone support (24h response)",
        included: true,
      },
      {
        id: "api_access",
        name: "API Access",
        description: "Full REST API with webhooks",
        included: false,
      },
      {
        id: "sso",
        name: "Single Sign-On (SSO)",
        description: "Enterprise SSO support",
        included: false,
      },
      {
        id: "custom_modules",
        name: "Custom Modules",
        description: "Create unlimited custom content",
        included: false,
      },
    ],
    limits: {
      maxEmployees: 100,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    tier: "enterprise",
    app: "bud-badge",
    monthlyPrice: 0, // Custom quote
    currency: "USD",
    billingCycle: "monthly",
    stripeProductId: "",
    stripePriceIds: {},
    features: [
      {
        id: "employees",
        name: "Team Members",
        description: "Unlimited employees",
        included: true,
      },
      {
        id: "training_modules",
        name: "Training Modules",
        description: "Unlimited custom modules",
        included: true,
      },
      {
        id: "basic_dashboard",
        name: "Compliance Dashboard",
        description: "Custom compliance workflows",
        included: true,
      },
      {
        id: "reporting",
        name: "Reporting",
        description: "Custom reports & BI integration",
        included: true,
      },
      {
        id: "user_management",
        name: "User Management",
        description: "Advanced permission hierarchy",
        included: true,
      },
      {
        id: "analytics",
        name: "Advanced Analytics",
        description: "Real-time dashboards & custom metrics",
        included: true,
      },
      {
        id: "priority_support",
        name: "Priority Support",
        description: "Dedicated account manager & 24/7 phone support",
        included: true,
      },
      {
        id: "api_access",
        name: "API Access",
        description: "Unlimited API access with priority rate limits",
        included: true,
      },
      {
        id: "sso",
        name: "Single Sign-On (SSO)",
        description: "SAML 2.0 & OpenID Connect",
        included: true,
      },
      {
        id: "custom_modules",
        name: "Custom Modules",
        description: "Full custom development support",
        included: true,
      },
    ],
  },
];

export const PLAN_LIMITS: Record<PlanTier, Record<string, number>> = {
  starter: {
    maxEmployees: 25,
    maxModules: 5,
  },
  professional: {
    maxEmployees: 100,
    maxModules: Infinity,
  },
  enterprise: {
    maxEmployees: Infinity,
    maxModules: Infinity,
  },
  community: {},
  pro: {},
  employer: {},
};

export const FEATURE_GATES: Record<PlanTier, Record<string, boolean>> = {
  starter: {
    basic_dashboard: true,
    reporting: true,
    user_management: true,
    analytics: false,
    priority_support: false,
    api_access: false,
    sso: false,
    custom_modules: false,
  },
  professional: {
    basic_dashboard: true,
    reporting: true,
    user_management: true,
    analytics: true,
    priority_support: true,
    api_access: false,
    sso: false,
    custom_modules: false,
  },
  enterprise: {
    basic_dashboard: true,
    reporting: true,
    user_management: true,
    analytics: true,
    priority_support: true,
    api_access: true,
    sso: true,
    custom_modules: true,
  },
  community: {},
  pro: {},
  employer: {},
};

/**
 * Get plan by tier
 */
export function getPlanByTier(tier: PlanTier): Plan | undefined {
  return BUD_BADGE_PLANS.find((plan) => plan.tier === tier);
}

/**
 * Get all available plans
 */
export function getAvailablePlans(): Plan[] {
  return BUD_BADGE_PLANS.filter((plan) => plan.stripePriceIds.monthly || plan.monthlyPrice === 0);
}

/**
 * Check if feature is available in plan
 */
export function hasFeature(tier: PlanTier, feature: string): boolean {
  return FEATURE_GATES[tier]?.[feature] ?? false;
}

/**
 * Get limit for a specific tier
 */
export function getLimit(tier: PlanTier, limitType: string): number {
  return PLAN_LIMITS[tier]?.[limitType] ?? 0;
}

/**
 * Check if plan has reached limit
 */
export function isAtLimit(tier: PlanTier, limitType: string, currentValue: number): boolean {
  const limit = getLimit(tier, limitType);
  return limit !== Infinity && currentValue >= limit;
}

/**
 * Get upgrade path for current plan
 */
export function getUpgradePath(currentTier: PlanTier): Plan | undefined {
  const tiers: PlanTier[] = ["starter", "professional", "enterprise"];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return undefined;
  }
  return getPlanByTier(tiers[currentIndex + 1]);
}

/**
 * Get downgrade path for current plan
 */
export function getDowngradePath(currentTier: PlanTier): Plan | undefined {
  const tiers: PlanTier[] = ["starter", "professional", "enterprise"];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex <= 0) {
    return undefined;
  }
  return getPlanByTier(tiers[currentIndex - 1]);
}

export default {
  BUD_BADGE_PLANS,
  PLAN_LIMITS,
  FEATURE_GATES,
  getPlanByTier,
  getAvailablePlans,
  hasFeature,
  getLimit,
  isAtLimit,
  getUpgradePath,
  getDowngradePath,
};
