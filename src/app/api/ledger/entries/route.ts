import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { LedgerEngine, LedgerLineEntry } from '@/lib/enterprise/ledger';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write'); // Require robust permission

    const body = await request.json();
    const { referenceCode, description, lines, date } = body;

    if (!referenceCode || !description || !lines || !Array.isArray(lines)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const postedEntry = await LedgerEngine.postEntry(
       session.organizationId,
       session.userId,
       referenceCode,
       description,
       lines as LedgerLineEntry[],
       date ? new Date(date) : new Date()
    );

    return NextResponse.json({ success: true, data: postedEntry }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/ledger/entries' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
