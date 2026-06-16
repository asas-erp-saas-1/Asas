import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ReservationService } from '@/domains/reservations/services/reservation.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'reservations', 'write');

    const { reservationId } = await params;

    const result = await ReservationService.cancelReservation(
      session.organizationId,
      reservationId,
      session.userId
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/reservations/[id]/cancel' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
