import { NextResponse } from 'next/server';
import { getTenantDb } from '@/db';
import { contracts, units, contacts, tickets } from '@/db/schema';
import { sql, eq, sum, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { CacheService } from "@/lib/cache/cache.service";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'read'); // Proxy permission

    const cacheKey = "board_metrics_dashboard";
    const cachedData = await CacheService.get(session.organizationId, cacheKey);
    if (cachedData) {
      return NextResponse.json({ data: cachedData });
    }

    const tenantDb = getTenantDb(session.organizationId);

    const dealsStats = await tenantDb.select({
       totalSales: sum(contracts.agreedPrice).mapWith(Number),
       dealCount: sql`count(${contracts.id})`.mapWith(Number)
    }).from(contracts)
      .where(and(eq(contracts.status, 'completed'), eq(contracts.organizationId, session.organizationId)));

    const propertiesStats = await tenantDb.select({
       totalProperties: sql`count(${units.id})`.mapWith(Number),
       availableProperties: sql`count(*) filter (where ${units.status} = 'available')`.mapWith(Number)
    }).from(units)
      .where(eq(units.organizationId, session.organizationId));

    const clientsStats = await tenantDb.select({
       totalClients: sql`count(${contacts.id})`.mapWith(Number)
    }).from(contacts)
      .where(eq(contacts.organizationId, session.organizationId));

    const risksStats = await tenantDb.select({
       activeRisks: sql`count(*) filter (where ${tickets.status} = 'open')`.mapWith(Number),
       totalRisks: sql`count(${tickets.id})`.mapWith(Number)
    }).from(tickets)
      .where(eq(tickets.organizationId, session.organizationId));

    const resultData = {
      revenue: dealsStats[0]?.totalSales || 0,
      completedDeals: dealsStats[0]?.dealCount || 0,
      totalProperties: propertiesStats[0]?.totalProperties || 0,
      availableProperties: propertiesStats[0]?.availableProperties || 0,
      totalClients: clientsStats[0]?.totalClients || 0,
      activeRisks: risksStats[0]?.activeRisks || 0
    };

    // Cache the metric values for 5 minutes
    await CacheService.set(session.organizationId, cacheKey, resultData, 300);

    return NextResponse.json({
       data: resultData
    });

  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/metrics/board' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
