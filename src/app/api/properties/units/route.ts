import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { UnitService } from '@/domains/properties/services/unit.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'read');

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    const units = await UnitService.listUnits(
      session.organizationId,
      buildingId || undefined
    );

    return NextResponse.json({ data: units }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/properties/units' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'write');

    const body = await request.json();

    if (!body.referenceCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newUnit = await UnitService.createUnit(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newUnit }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/properties/units' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
