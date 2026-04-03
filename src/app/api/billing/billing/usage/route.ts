/**
 * Bud Badge Billing API - Usage Tracking
 * GET /api/billing/usage?customerId=xxx
 * POST /api/billing/usage
 *
 * Tracks usage metrics against plan limits
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLimit, isAtLimit } from "@/lib/stripe/config";
import { PlanTier } from "@/lib/stripe/types";

const usageQuerySchema = z.object({
  customerId: z.string().min(1, "Customer ID required"),
});

const usageUpdateSchema = z.object({
  customerId: z.string().min(1, "Customer ID required"),
  metric: z.enum(["employees", "modules"]),
  value: z.number().int().nonnegative(),
});

/**
 * GET /api/billing/usage
 * Get current usage for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { customerId } = usageQuerySchema.parse({
      customerId: searchParams.get("customerId"),
    });

    // TODO: Fetch from database
    // const usage = await db.usage.findUnique({
    //   where: { customerId },
    //   include: { subscription: true }
    // });

    // Mock response
    const usage = {
      customerId,
      currentPlan: "professional" as PlanTier,
      metrics: {
        employees: {
          used: 48,
          limit: getLimit("professional", "maxEmployees"),
          percentage: 48,
        },
        modules: {
          used: 12,
          limit: getLimit("professional", "maxModules"),
          percentage: 12,
        },
      },
      warnings: [] as string[],
    };

    // Check for limits approaching
    if (isAtLimit(usage.currentPlan, "maxEmployees", usage.metrics.employees.used)) {
      usage.warnings.push(
        `You have reached your employee limit of ${usage.metrics.employees.limit}`
      );
    }

    if (usage.metrics.employees.percentage >= 80) {
      usage.warnings.push(
        `You are using ${usage.metrics.employees.percentage}% of your employee limit`
      );
    }

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Usage query error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing/usage
 * Update usage metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, metric, value } = usageUpdateSchema.parse(body);

    // TODO: Update usage in database
    // await db.usage.update({
    //   where: { customerId },
    //   data: {
    //     [metric]: value,
    //     updatedAt: new Date()
    //   }
    // });

    return NextResponse.json(
      {
        success: true,
        customerId,
        metric,
        value,
        updatedAt: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Usage update error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update usage" },
      { status: 500 }
    );
  }
}
