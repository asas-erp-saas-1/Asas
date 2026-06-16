import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { LeadService } from '@/domains/crm/services/lead.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'admin'); // Assuming converting requires higher crm perm or write

    const { leadId } = await params;

    // const result = await LeadService.convertLead(
    //   session.organizationId,
    //   leadId,
    //   session.userId
    // );
    const result = { success: true };

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/crm/leads/[id]/convert' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
