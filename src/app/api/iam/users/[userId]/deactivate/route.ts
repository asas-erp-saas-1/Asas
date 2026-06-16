import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { IAMService } from '@/domains/iam/services/iam.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'users', 'admin');

    const { userId } = await params;

    const deactivated = await IAMService.deactivateUser(
      session.organizationId,
      userId,
      session.userId
    );

    return NextResponse.json({ data: deactivated }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/iam/users/deactivate' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
