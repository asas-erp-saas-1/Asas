import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { OpportunityService } from '@/domains/crm/services/opportunity.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'read');

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;

    const list = await OpportunityService.listOpportunities(session.organizationId, stage);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/crm/opportunities' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'write');

    const body = await request.json();

    if (!body.contactId) {
      return NextResponse.json({ error: 'Missing contactId' }, { status: 400 });
    }

    const newOpp = await OpportunityService.createOpportunity(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newOpp }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/crm/opportunities' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
