import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ContactService } from '@/domains/crm/services/contact.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'read');

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;

    const list = await ContactService.listContacts(session.organizationId, type);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/crm/contacts' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'crm', 'write');

    const body = await request.json();

    const newContact = await ContactService.createContact(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newContact }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/crm/contacts' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
