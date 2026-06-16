import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ContractService } from '@/domains/contracts/services/contract.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'contracts', 'read');

    const contracts = await ContractService.listContracts(session.organizationId);
    return NextResponse.json({ data: contracts }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/contracts' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'contracts', 'write');

    const body = await request.json();

    if (!body.unitId || !body.contactId || !body.referenceCode || !body.agreedPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newContract = await ContractService.createContract(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newContract }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/contracts' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
