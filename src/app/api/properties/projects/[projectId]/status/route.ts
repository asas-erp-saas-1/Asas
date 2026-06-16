import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ProjectService } from '@/domains/properties/services/project.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'write');

    const { projectId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing required status' }, { status: 400 });
    }

    const updated = await ProjectService.updateProjectStatus(
      session.organizationId,
      projectId,
      status,
      session.userId
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/properties/projects/[id]/status' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
