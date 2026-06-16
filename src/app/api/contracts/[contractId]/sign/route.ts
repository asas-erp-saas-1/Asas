import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ContractService } from '@/domains/contracts/services/contract.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ contractId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'contracts', 'write'); // or sign

    const { contractId } = await params;

    const result = await ContractService.signContract(
      session.organizationId,
      contractId,
      session.userId
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/contracts/[id]/sign' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
