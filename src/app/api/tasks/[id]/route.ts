import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { parseAndValidate, taskSchema, ValidationError } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    requirePermission(session, 'tasks', 'write');
    const params = await props.params;
    const body = await request.json();
    
    // Server-side validation using Zod
    const validatedData = parseAndValidate(taskSchema, body, 'Task Update');
    
    const updates: any = {};
    if (validatedData.status) updates.status = validatedData.status;
    if (validatedData.title) updates.title = validatedData.title;
    if (validatedData.description) updates.description = validatedData.description;
    
    const [task] = await db.update(tasks)
       .set(updates)
       .where(and(eq(tasks.id, params.id), eq(tasks.organizationId, session.organizationId)))
       .returning();
       
    return NextResponse.json({ data: task });
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message, details: error.field }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
