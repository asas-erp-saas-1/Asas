import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { OrganizationService } from '@/domains/organizations/services/organization.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    
    const { searchParams } = new URL(request.url);
    const groupName = searchParams.get('groupName') || undefined;
    
    // Only admins usually can read all settings, or maybe everyone read ?
    // Let's assume read is open for org users, but write is admin
    requirePermission(session, 'organizations', 'read');

    const settings = await OrganizationService.getSettings(session.organizationId, groupName);

    return NextResponse.json({ data: settings }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/organizations/settings' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'organizations', 'admin');

    const body = await request.json();
    const { groupName, key, value } = body;

    if (!groupName || !key || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSetting = await OrganizationService.updateSetting(
      session.organizationId,
      groupName,
      key,
      value,
      session.userId
    );

    return NextResponse.json({ data: newSetting }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/organizations/settings' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
