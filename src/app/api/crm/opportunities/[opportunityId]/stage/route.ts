import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { OpportunityService } from '@/domains/crm/services/opportunity.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'write');

    const { opportunityId } = await params;
    const body = await request.json();
    const { stage } = body;

    if (!stage) {
      return NextResponse.json({ error: 'Missing stage' }, { status: 400 });
    }

    const updated = await OpportunityService.updateOpportunityStage(
      session.organizationId,
      opportunityId,
      stage,
      session.userId
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/crm/opportunities/[id]/stage' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
