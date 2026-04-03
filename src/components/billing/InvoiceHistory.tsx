/**
 * Bud Badge Invoice History Component
 * Displays past invoices with download links
 */

"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/stripe/helpers";
import { Invoice } from "@/lib/stripe/types";

interface InvoiceHistoryProps {
  customerId: string;
  limit?: number;
}

export function InvoiceHistory({ customerId, limit = 12 }: InvoiceHistoryProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock invoices - in production, fetch from API
    const mockInvoices: Invoice[] = [
      {
        id: "in_1",
        number: "INV-001",
        customerId,
        subscriptionId: "sub_1",
        amount: 14900,
        currency: "usd",
        status: "paid",
        pdfUrl: "/invoices/inv-001.pdf",
        createdAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 0 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000),
        attemptCount: 1,
        nextAttemptDate: null,
      },
      {
        id: "in_2",
        number: "INV-002",
        customerId,
        subscriptionId: "sub_1",
        amount: 14900,
        currency: "usd",
        status: "paid",
        pdfUrl: "/invoices/inv-002.pdf",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        attemptCount: 1,
        nextAttemptDate: null,
      },
      {
        id: "in_3",
        number: "INV-003",
        customerId,
        subscriptionId: "sub_1",
        amount: 14900,
        currency: "usd",
        status: "paid",
        pdfUrl: "/invoices/inv-003.pdf",
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        paidAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        attemptCount: 1,
        nextAttemptDate: null,
      },
    ];

    setInvoices(mockInvoices.slice(0, limit));
    setLoading(false);
  }, [customerId, limit]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No invoices yet</p>
      </div>
    );
  }

  const statusStyles: Record<string, string> = {
    paid: "text-green-700 bg-green-50",
    open: "text-amber-700 bg-amber-50",
    uncollectible: "text-red-700 bg-red-50",
    void: "text-gray-700 bg-gray-50",
    draft: "text-gray-700 bg-gray-50",
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Invoice History</h3>
      </div>

      <div className="divide-y divide-gray-200">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{invoice.number}</p>
              <p className="text-sm text-gray-600">
                {invoice.createdAt.toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency.toUpperCase())}
                </p>
                <p
                  className={`text-xs font-medium rounded px-2 py-1 ${
                    statusStyles[invoice.status] || statusStyles.draft
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </p>
              </div>

              <a
                href={invoice.pdfUrl}
                download
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

      {invoices.length < 12 && (
        <div className="px-6 py-4 bg-gray-50 text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View More Invoices
          </button>
        </div>
      )}
    </div>
  );
}
