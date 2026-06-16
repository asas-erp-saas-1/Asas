import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { NotificationService } from '@/domains/notifications/services/notification.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const list = await NotificationService.listNotifications(session.organizationId, session.userId, unreadOnly);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/notifications' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();

    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    const updated = await NotificationService.markAsRead(
      session.organizationId,
      notificationId,
      session.userId
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/notifications' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
