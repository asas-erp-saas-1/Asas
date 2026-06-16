import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { IAMService } from '@/domains/iam/services/iam.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'users', 'read');

    const mappedUsers = await IAMService.listUsers(session.organizationId);

    return NextResponse.json({ data: mappedUsers }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/iam/users' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'users', 'admin');

    const body = await request.json();
    const { email, firstName, lastName, provider } = body;

    if (!email || !firstName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newUser = await IAMService.createUser(
      session.organizationId,
      email,
      firstName,
      lastName,
      provider || 'local',
      session.userId
    );

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/iam/users' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
