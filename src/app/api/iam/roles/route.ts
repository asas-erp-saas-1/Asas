import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { IAMService } from '@/domains/iam/services/iam.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'roles', 'read');

    const mappedRoles = await IAMService.listRoles(session.organizationId);

    return NextResponse.json({ data: mappedRoles }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/iam/roles' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'roles', 'admin');

    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRole = await IAMService.createRole(
      session.organizationId,
      name,
      description,
      permissions,
      session.userId
    );

    return NextResponse.json({ data: newRole }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/iam/roles' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
