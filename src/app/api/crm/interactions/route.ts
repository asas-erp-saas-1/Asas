import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { InteractionService } from '@/domains/crm/services/interaction.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'read');

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');

    if (!contactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
    }

    const interactions = await InteractionService.listInteractionsByContact(session.organizationId, contactId);
    return NextResponse.json({ data: interactions }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/crm/interactions' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'write');

    const body = await request.json();

    if (!body.contactId || !body.type || !body.interactionDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newInteraction = await InteractionService.createInteraction(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newInteraction }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/crm/interactions' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
