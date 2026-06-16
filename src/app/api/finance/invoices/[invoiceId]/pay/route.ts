import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { FinanceService } from '@/domains/finance/services/finance.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'finance', 'write');

    const { invoiceId } = await params;

    const result = await FinanceService.markInvoicePaid(
      session.organizationId,
      invoiceId,
      session.userId
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/finance/invoices/[id]/pay' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
