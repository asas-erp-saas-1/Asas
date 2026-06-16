import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ReservationService } from '@/domains/reservations/services/reservation.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'reservations', 'read');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const list = await ReservationService.listReservations(
      session.organizationId,
      status || undefined
    );

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/reservations' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'reservations', 'write');

    const body = await request.json();

    if (!body.unitId || !body.contactId || !body.expirationDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRes = await ReservationService.createReservation(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newRes }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/reservations' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
