import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { FinanceService } from '@/domains/finance/services/finance.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'finance', 'read');

    const invs = await FinanceService.listInvoices(session.organizationId);

    return NextResponse.json({ data: invs }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/finance/invoices' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'finance', 'write');

    const body = await request.json();

    if (!body.contactId || !body.referenceCode || !body.amount || !body.issueDate || !body.dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newInvoice = await FinanceService.createInvoice(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newInvoice }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/finance/invoices' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
