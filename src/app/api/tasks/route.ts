import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'tasks', 'read');
    
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;
    const deal_id = searchParams.get('deal_id');
    const lead_id = searchParams.get('lead_id');
    const assigned_to = searchParams.get('assigned_to');

    const filters = [eq(tasks.organizationId, session.organizationId)];
    
    if (deal_id) {
       filters.push(eq(tasks.entityId, deal_id));
       filters.push(eq(tasks.entityType, 'deal'));
    }
    if (lead_id) {
       filters.push(eq(tasks.entityId, lead_id));
       filters.push(eq(tasks.entityType, 'lead'));
    }
    if (assigned_to) {
       filters.push(eq(tasks.assignedTo, assigned_to));
    }

    const tasksList = await db.select()
      .from(tasks)
      .where(and(...filters))
      .orderBy(desc(tasks.createdAt))
      .limit(limit)
      .offset(offset);

    // Map back for UI compatibility
    const mapped = tasksList.map(t => ({
      ...t,
      agency_id: t.organizationId,
      due_date: t.dueDate,
      deal_id: t.entityType === 'deal' ? t.entityId : null,
      lead_id: t.entityType === 'lead' ? t.entityId : null,
      assigned_to: t.assignedTo,
    }));

    return NextResponse.json({ data: mapped, count: mapped.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'tasks', 'write');
    const data = await request.json();
    
    let entityType = null;
    let entityId = null;
    
    if (data.deal_id) {
       entityType = 'deal';
       entityId = data.deal_id;
    } else if (data.lead_id) {
       entityType = 'lead';
       entityId = data.lead_id;
    }

    const [task] = await db.insert(tasks).values({
      organizationId: session.organizationId,
      title: data.title,
      description: data.description || null,
      assignedTo: data.assigned_to || session.userId,
      createdBy: session.userId,
      status: data.status || 'open',
      dueDate: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : null,
      entityType: entityType,
      entityId: entityId
    } as any).returning();
    
    return NextResponse.json({ data: {
      ...task,
      assigned_to: task?.assignedTo
    } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'tasks', 'write');
    const { id, ...data } = await request.json();
    if (!id) throw new Error('ID is required');
    
    const updates: any = {};
    if (data.status) updates.status = data.status;
    if (data.title) updates.title = data.title;
    if (data.description) updates.description = data.description;
    
    const [task] = await db.update(tasks)
       .set(updates)
       .where(and(eq(tasks.id, id), eq(tasks.organizationId, session.organizationId)))
       .returning();
       
    return NextResponse.json({ data: task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
