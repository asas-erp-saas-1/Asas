import { NextResponse } from "next/server";
import { getTenantDb } from "@/db";
import { contracts, tickets, invoices, journalEntries } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { ErrorTracker } from "@/lib/observability/errors";
import { requireSession } from "@/lib/enterprise/auth";
import { requirePermission } from "@/lib/enterprise/rbac";
import { CacheService } from "@/lib/cache/cache.service";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Proxy permission check for dashboard level
    requirePermission(session, "deals", "read");

    const cacheKey = "ceo_metrics_dashboard";
    const cachedData = await CacheService.get(session.organizationId, cacheKey);
    if (cachedData) {
      return NextResponse.json({ data: cachedData });
    }

    const tenantDb = getTenantDb(session.organizationId);

    // Calculate real business health score based on deals completed vs total
    const dealsStats = await tenantDb
      .select({
        total: sql`count(*)`.mapWith(Number),
        completed:
          sql`count(*) filter (where ${contracts.status} = 'completed' or ${contracts.status} = 'closed')`.mapWith(
            Number,
          ),
        revenue: sql`sum(${contracts.agreedPrice})`.mapWith(Number),
      })
      .from(contracts)
      .where(eq(contracts.organizationId, session.organizationId));

    const totalDeals = dealsStats[0]?.total || 0;
    const completedDeals = dealsStats[0]?.completed || 0;
    const portfolioAum = dealsStats[0]?.revenue || 0;
    const actualScore =
      totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;

    // Risks extracted mapped from tickets
    const risks = await tenantDb
      .select()
      .from(tickets)
      .where(eq(tickets.organizationId, session.organizationId))
      .limit(10);
    const riskData = risks.map((r) => ({
      x:
        r.priority === "urgent"
          ? 90
          : r.priority === "high"
            ? 70
            : r.priority === "medium"
              ? 40
              : 20,
      y: r.status === "open" ? 80 : r.status === "in_progress" ? 40 : 10,
      z: 150,
      name: r.category || "General Risk",
      color:
        r.priority === "urgent"
          ? "#ef4444"
          : r.priority === "high"
            ? "#f97316"
            : "#eab308",
    }));

    // Treasury / Expenses from journal entries
    const treasury = await tenantDb
      .select({
        month: sql`EXTRACT(MONTH FROM ${journalEntries.entryDate})`.mapWith(
          Number,
        ),
        net: sql`sum(CASE WHEN ${journalEntries.description} ILIKE '%Revenue%' THEN 1 ELSE 0 END)`.mapWith(
          Number,
        ),
      })
      .from(journalEntries)
      .where(eq(journalEntries.organizationId, session.organizationId))
      .groupBy(sql`1`);

    const treasuryData = treasury.slice(0, 7).map((t) => ({
      name: `Month ${t.month}`,
      val: t.net,
    }));

    const resultData = {
      businessHealth: actualScore.toFixed(1),
      portfolioAum: portfolioAum,
      treasuryRunway: 0, // Needs full runway model, sending 0 for transparency
      profitMargin: 0, // Needs full finance calc
      treasuryData: treasuryData.length > 0 ? treasuryData : [],
      riskData: riskData,
      departmentData: [
        { name: "Sales", target: 100, actual: actualScore },
        { name: "Construction", target: 100, actual: 0 },
        { name: "Finance", target: 100, actual: 0 },
        { name: "HR", target: 100, actual: 0 },
      ],
    };

    // Cache the comprehensive analytics for 5 minutes (300 seconds)
    await CacheService.set(session.organizationId, cacheKey, resultData, 300);

    return NextResponse.json({
      data: resultData,
    });
  } catch (error: any) {
    if (
      error.message === "Unauthorized" ||
      error.message.includes("Forbidden")
    ) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: "GET /api/metrics/ceo" });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
