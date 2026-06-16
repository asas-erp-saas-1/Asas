import { NextResponse } from 'next/server';
import { db } from '@/db';
import { units } from '@/db/schema';
import { eq, desc, ilike, and, or } from 'drizzle-orm';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'read');

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 24;
    const status = searchParams.get('status');
    const q = searchParams.get('q');

    let conditions = [eq(units.organizationId, session.organizationId)];
    
    if (status) conditions.push(eq(units.status, status));
    if (q) {
      conditions.push(ilike(units.referenceCode, `%${q}%`));
    }

    const whereClause = and(...conditions);

    const propertyResults = await db.select()
      .from(units)
      .where(whereClause)
      .orderBy(desc(units.createdAt))
      .limit(limit);

    // Map `units` back to frontend `properties` format temporarily
    const mappedResults = propertyResults.map(u => ({
      ...u,
      title: u.referenceCode,
      price: u.basePrice,
      area: u.areaSqm
    }));

    return NextResponse.json({ data: mappedResults, count: mappedResults.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'properties', 'write');

    const payload = await request.json();
    
    // Defaulting required fields if absent
    const data = {
      organizationId: session.organizationId,
      referenceCode: payload.title || payload.referenceCode || 'Untitled Property',
      basePrice: String(payload.price || payload.list_price || payload.basePrice || 0),
      status: payload.status || 'available',
      areaSqm: payload.area || payload.area_sqm || payload.areaSqm || null,
      metadata: {
        type: payload.type || 'other',
        description: payload.description || payload.notes || null,
        location: payload.location || null,
      }
    };

    const [insertedUnit] = await db.insert(units).values(data).returning();
    
    const mapped = {
      ...insertedUnit,
      title: insertedUnit?.referenceCode,
      price: insertedUnit?.basePrice,
      area: insertedUnit?.areaSqm
    };
    
    return NextResponse.json({ data: mapped }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
