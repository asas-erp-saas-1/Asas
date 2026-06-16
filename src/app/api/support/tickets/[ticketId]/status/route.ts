import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { TicketService } from '@/domains/support/services/ticket.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'support', 'write');

    const { ticketId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const updated = await TicketService.updateTicketStatus(
      session.organizationId,
      ticketId,
      status,
      session.userId
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/support/tickets/[id]/status' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
