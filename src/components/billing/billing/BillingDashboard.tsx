/**
 * Bud Badge Billing Dashboard Component
 * Shows current plan, usage meters, next invoice, payment method
 */

"use client";

import { useEffect, useState } from "react";
import { PlanBadge } from "./PlanBadge";
import { UsageBar } from "./UsageBar";
import { InvoiceHistory } from "./InvoiceHistory";
import { formatCurrency, getStatusLabel } from "@/lib/stripe/helpers";

interface BillingDashboardProps {
  customerId: string;
}

interface UsageData {
  customerId: string;
  currentPlan: string;
  metrics: Record<
    string,
    {
      used: number;
      limit: number | null;
      percentage: number;
    }
  >;
  warnings: string[];
}

export function BillingDashboard({ customerId }: BillingDashboardProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch(`/api/billing/usage?customerId=${customerId}`);
        if (!res.ok) throw new Error("Failed to fetch usage");
        const data = await res.json();
        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, [customerId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        {error}
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No billing information found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Warnings */}
      {usage.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Usage Warnings</h3>
          <ul className="space-y-1">
            {usage.warnings.map((warning, i) => (
              <li key={i} className="text-sm text-amber-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Change Plan
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 text-sm mb-1">Plan</p>
            <PlanBadge tier={usage.currentPlan as any} />
          </div>
          <div>
            <p className="text-gray-600 text-sm mb-1">Billing Cycle</p>
            <p className="text-lg font-semibold text-gray-900">Monthly</p>
          </div>
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Usage This Cycle</h2>
        <div className="space-y-6">
          {Object.entries(usage.metrics).map(([key, metric]) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <span className="capitalize font-medium text-gray-900">
                  {key}
                </span>
                <span className="text-sm text-gray-600">
                  {metric.used} {metric.limit ? `of ${metric.limit}` : "unlimited"}
                </span>
              </div>
              <UsageBar
                used={metric.used}
                limit={metric.limit}
                percentage={metric.percentage}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Next Invoice */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Next Invoice</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(14900)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-semibold text-gray-900">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">
                {getStatusLabel("active")}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
          <div className="bg-gray-50 rounded p-4 mb-4">
            <div className="flex items-center">
              <div className="w-12 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium text-gray-900">Visa ending in 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Update Payment Method
          </button>
        </div>
      </div>

      {/* Invoice History */}
      <InvoiceHistory customerId={customerId} />

      {/* Billing Actions */}
      <div className="flex gap-4">
        <button className="flex-1 bg-white border border-gray-300 rounded-lg py-3 font-medium text-gray-900 hover:bg-gray-50 transition-colors">
          Cancel Subscription
        </button>
        <button className="flex-1 bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition-colors">
          Manage Billing
        </button>
      </div>
    </div>
  );
}
