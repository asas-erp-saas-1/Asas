import { NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    
    // Check if admin
    if (session.role !== 'admin' && session.role !== 'super_admin') {
       return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const entityType = searchParams.get('entityType');
    
    let baseWhere = eq(auditLogs.organizationId, session.organizationId);
    if (entityType) {
       baseWhere = and(baseWhere, eq(auditLogs.entityType, entityType)) as any;
    }

    const query = db.select({
       id: auditLogs.id,
       action: auditLogs.action,
       entityType: auditLogs.entityType,
       entityId: auditLogs.entityId,
       createdAt: auditLogs.createdAt,
       user: {
          id: users.id,
          name: users.firstName,
          email: users.email
       }
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .where(baseWhere);
    
    const logs = await query.orderBy(desc(auditLogs.createdAt)).limit(limit);

    return NextResponse.json({ data: logs, count: logs.length });
  } catch (error: any) {
    ErrorTracker.captureError(error, { context: 'GET /api/system/audit' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
