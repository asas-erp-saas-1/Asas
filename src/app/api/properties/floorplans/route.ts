import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { FloorplanService } from '@/domains/properties/services/floorplan.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'read');

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const floorplans = await FloorplanService.listFloorplans(
      session.organizationId,
      projectId || undefined
    );

    return NextResponse.json({ data: floorplans }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/properties/floorplans' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'write');

    const body = await request.json();

    if (!body.projectId || !body.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newFloorplan = await FloorplanService.createFloorplan(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newFloorplan }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/properties/floorplans' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
