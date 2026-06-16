import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, contracts, contacts } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'read');

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const dealId = searchParams.get('dealId');

    let baseWhere = eq(invoices.organizationId, session.organizationId);
    if (dealId) {
       baseWhere = and(baseWhere, eq(invoices.contractId, dealId)) as any;
    }

    const query = db.select({
      id: invoices.id,
      dealId: invoices.contractId,
      reference: invoices.referenceCode,
      amount: invoices.amount,
      status: invoices.status,
      dueDate: invoices.dueDate,
      createdAt: invoices.createdAt,
      deal_id: contracts.id,
      deal_reference: contracts.referenceCode,
      client_firstName: contacts.firstName,
      client_lastName: contacts.lastName,
    })
    .from(invoices)
    .leftJoin(contracts, eq(invoices.contractId, contracts.id))
    .leftJoin(contacts, eq(invoices.contactId, contacts.id))
    .where(baseWhere);

    const results = await query.orderBy(desc(invoices.createdAt)).limit(limit);
    
    // Map data for front-end
    const formatted = results.map(inv => ({
       ...inv,
       deals: {
          id: inv.deal_id,
          reference: inv.deal_reference,
       },
       customer_name: (inv.client_firstName || inv.client_lastName) ? `${inv.client_firstName || ''} ${inv.client_lastName || ''}`.trim() : 'Unknown Customer'
    }))

    return NextResponse.json({ data: formatted, count: formatted.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/invoices' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write');

    const body = await request.json();
    const { dealId, amount, dueDate, status, contactId } = body;
    
    if (!dealId || !amount || !dueDate) {
      return NextResponse.json({ error: 'dealId, amount, and dueDate are required' }, { status: 400 });
    }

    const reference = `INV-${Date.now().toString().slice(-6)}`;

    // Need a contactId. If not provided, fetch the deal to get contactId.
    let targetContactId = contactId;
    if (!targetContactId) {
       const contractRecord = await db.select().from(contracts).where(eq(contracts.id, dealId)).limit(1);
       if (contractRecord.length > 0) {
         targetContactId = contractRecord[0]?.contactId;
       }
    }

    if (!targetContactId) {
      return NextResponse.json({ error: 'contactId is required' }, { status: 400 });
    }

    // Due Date mapping
    const due = new Date(dueDate);
    const dateStr = due.toISOString().split('T')[0];

    // Issue Date
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const newInvoice = await db.insert(invoices).values({
      organizationId: session.organizationId,
      contactId: targetContactId,
      contractId: dealId,
      referenceCode: reference,
      amount: String(amount),
      issueDate: todayStr,
      dueDate: dateStr,
      status: status || 'unpaid'
    } as any).returning();

    return NextResponse.json({ data: newInvoice[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/invoices' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
