import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'clients', 'read');

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 50;
    const id = searchParams.get('id');

    if (id) {
      const clientResult = await db.select().from(contacts).where(
        and(
          eq(contacts.id, id),
          eq(contacts.organizationId, session.organizationId)
        )
      ).limit(1);
      if (clientResult.length === 0) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      return NextResponse.json({ data: {
         ...clientResult[0],
         full_name: `${clientResult[0]?.firstName || ''} ${clientResult[0]?.lastName || ''}`
      }});
    }

    const allClients = await db.select()
      .from(contacts)
      .where(eq(contacts.organizationId, session.organizationId))
      .orderBy(desc(contacts.createdAt))
      .limit(limit);
      
    const mappedClients = allClients.map(c => ({
       ...c,
       full_name: `${c.firstName} ${c.lastName}`
    }));
    return NextResponse.json({ data: mappedClients, count: mappedClients.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/clients' });
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'clients', 'write');
    
    const body = await request.json();
    const { firstName, lastName, email, phone, type, companyName } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }

    const newClient = await db.insert(contacts).values({
      organizationId: session.organizationId,
      firstName,
      lastName,
      email,
      phone,
      type: type || 'individual',
      companyName,
    }).returning();

    return NextResponse.json({ data: newClient[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/clients' });
    return NextResponse.json({ error: 'Failed to create client', message: error.message }, { status: 500 });
  }
}
