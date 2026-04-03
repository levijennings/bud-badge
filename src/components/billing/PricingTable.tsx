/**
 * Bud Badge Pricing Table Component
 * Responsive pricing comparison table with feature matrix
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { BUD_BADGE_PLANS } from "@/lib/stripe/config";
import { formatCurrency } from "@/lib/stripe/helpers";

export function PricingTable() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = BUD_BADGE_PLANS.filter((p) => p.stripePriceIds.monthly || p.monthlyPrice === 0);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your team
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                billingCycle === "annual"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              Annual
              <span className="ml-2 text-sm font-semibold text-green-600">
                Save 15%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const price = billingCycle === "annual" && plan.annualPrice
              ? plan.annualPrice
              : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border transition-all ${
                  plan.popular
                    ? "border-blue-600 shadow-xl md:scale-105 md:z-10"
                    : "border-gray-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  {plan.monthlyPrice === 0 ? (
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">Free</span>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">
                        {formatCurrency(price, "USD")}
                      </span>
                      <span className="text-gray-600 ml-2">
                        per {billingCycle === "annual" ? "year" : "month"}
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold mb-8 transition-colors ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-300 text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Get Started
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-900 uppercase">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.id} className="flex items-start">
                          {feature.included ? (
                            <svg
                              className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          <span
                            className={`text-sm ${
                              feature.included ? "text-gray-700" : "text-gray-400"
                            }`}
                          >
                            {feature.name}
                            {feature.limit && (
                              <span className="block text-xs text-gray-500 mt-1">
                                Up to {feature.limit}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise CTA */}
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need something bigger?
          </h2>
          <p className="text-gray-600 mb-6">
            Our Enterprise plan offers unlimited everything plus dedicated support.
          </p>
          <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-900 hover:bg-gray-100 transition-colors">
            Talk to Sales
          </button>
        </div>
      </div>
    </div>
  );
}
