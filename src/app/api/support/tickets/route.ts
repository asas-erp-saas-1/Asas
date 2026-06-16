import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { TicketService } from '@/domains/support/services/ticket.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Assuming support or tickets domain mapped under crm or support permission. We'll use 'support'
    requirePermission(session, 'support', 'read');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const list = await TicketService.listTickets(session.organizationId, status);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/support/tickets' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'support', 'write');

    const body = await request.json();

    if (!body.subject) {
      return NextResponse.json({ error: 'Missing required field: subject' }, { status: 400 });
    }

    const newTicket = await TicketService.createTicket(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newTicket }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/support/tickets' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
