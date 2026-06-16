import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts, units, contacts } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { logAudit } from '@/lib/enterprise/audit';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'read');

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 25;
    const id = searchParams.get('id');
    
    let baseWhere = eq(contracts.organizationId, session.organizationId);

    if (id) {
       baseWhere = and(baseWhere, eq(contracts.id, id)) as any;
    }
    
    let query = db.select({
      id: contracts.id,
      reference: contracts.referenceCode,
      status: contracts.status,
      agreedPrice: contracts.agreedPrice,
      dealType: contracts.status,
      createdAt: contracts.createdAt,
      client_id: contacts.id,
      client_full_name: contacts.lastName,
      client_firstName: contacts.firstName,
      client_lastName: contacts.lastName,
      client_phone: contacts.phone,
      property_id: units.id,
      property_title: units.referenceCode,
      property_projectName: units.referenceCode,
    })
    .from(contracts)
    .leftJoin(contacts, eq(contracts.contactId, contacts.id))
    .leftJoin(units, eq(contracts.unitId, units.id))
    .where(baseWhere);
    
    if (id) {
       const dealResult = await query.limit(1);
       if (dealResult.length === 0) {
         return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
       }
       
       await logAudit({
          organizationId: session.organizationId,
          userId: session.userId,
          action: 'VIEW_DEAL',
          entityType: 'contracts',
          entityId: String(dealResult[0]?.id || '')
       });

       return NextResponse.json({ data: dealResult[0], count: 1 });
    }
    
    const allDeals = await query.orderBy(desc(contracts.createdAt)).limit(limit);
    
    await logAudit({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'LIST_DEALS',
        entityType: 'contracts',
        entityId: 'ALL'
    });

    return NextResponse.json({ data: allDeals, count: allDeals.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/deals' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write');

    const body = await request.json();
    
    // Process input
    const clientId = body.clientId || body.client_id;
    const propertyId = body.propertyId || body.property_id;
    const agreedPrice = body.agreedPrice || body.agreed_price;

    if (!clientId || !propertyId || !agreedPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reference = `DL-${Date.now().toString().slice(-6)}`;

    const newDeal = await db.insert(contracts).values({
      organizationId: session.organizationId,
      referenceCode: reference,
      contactId: clientId,
      unitId: propertyId,
      agreedPrice: String(agreedPrice),
      status: 'draft'
    }).returning();

    await logAudit({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'CREATE_DEAL',
        entityType: 'contracts',
        entityId: String(newDeal[0]?.id || ''),
        newData: newDeal[0]
    });

    // Make old response shape locally
    const dealFormat = {
      ...newDeal[0],
      reference: newDeal[0]?.referenceCode,
      propertyId: newDeal[0]?.unitId,
      clientId: newDeal[0]?.contactId
    };

    return NextResponse.json({ data: dealFormat }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/deals' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write');

    const body = await request.json();
    
    const id = body.id;
    const status = body.status;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields id, status' }, { status: 400 });
    }

    const updatedDeal = await db.update(contracts).set({
      status: status
    }).where(and(eq(contracts.id, id), eq(contracts.organizationId, session.organizationId))).returning();

    if (updatedDeal.length === 0) {
      return NextResponse.json({ error: 'Not found or permission denied' }, { status: 404 });
    }

    await logAudit({
        organizationId: session.organizationId,
        userId: session.userId,
        action: 'WORKFLOW_TRANSITION',
        entityType: 'contracts',
        entityId: String(updatedDeal[0]?.id || ''),
        newData: { status: status }
    });

    const dealFormat = {
      ...updatedDeal[0],
      reference: updatedDeal[0]?.referenceCode,
      propertyId: updatedDeal[0]?.unitId,
      clientId: updatedDeal[0]?.contactId
    };

    return NextResponse.json({ data: dealFormat }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PUT /api/deals' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

