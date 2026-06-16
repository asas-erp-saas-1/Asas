import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { OrganizationService } from '@/domains/organizations/services/organization.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Assuming users can always read their own org details.
    
    const org = await OrganizationService.getCurrentOrganization(session.organizationId);

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ data: org }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/organizations/current' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'organizations', 'admin'); // or 'update'

    const body = await request.json();
    const { name, domain, subscriptionStatus } = body;

    const updatedOrg = await OrganizationService.updateOrganization(
      session.organizationId,
      { name, domain, subscriptionStatus },
      session.userId
    );

    return NextResponse.json({ data: updatedOrg }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/organizations/current' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
