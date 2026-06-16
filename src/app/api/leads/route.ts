import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, contacts } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'clients', 'read'); // usually leads fall under clients/CRM permissions

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;

    const leadsResult = await db.select({
      id: leads.id,
      clientId: leads.contactId,
      source: leads.source,
      status: leads.status,
      assignedAgent: leads.assignedTo,
      createdAt: leads.createdAt,
      clients: {
        id: contacts.id,
        phone: contacts.phone,
        full_name: contacts.lastName, // fallback
        firstName: contacts.firstName,
        lastName: contacts.lastName,
      }
    })
      .from(leads)
      .leftJoin(contacts, eq(leads.contactId, contacts.id))
      .where(eq(leads.organizationId, session.organizationId))
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    const formatted = leadsResult.map(l => ({
      ...l,
      clients: l.clients ? {
         ...l.clients,
         full_name: `${l.clients.firstName} ${l.clients.lastName}`
      } : null
    }));

    return NextResponse.json({ data: formatted, count: formatted.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/leads' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'clients', 'write');

    const body = await request.json();
    const clientId = body.clientId || body.client_id;
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const newLead = await db.insert(leads).values({
      organizationId: session.organizationId,
      contactId: clientId,
      source: body.source,
      notes: `Budget Min: ${body.budgetMin || body.budget_min || 'N/A'}, Budget Max: ${body.budgetMax || body.budget_max || 'N/A'}`,
      assignedTo: body.assignedAgent || body.assigned_agent || undefined,
    }).returning();

    return NextResponse.json({ data: newLead[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/leads' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
