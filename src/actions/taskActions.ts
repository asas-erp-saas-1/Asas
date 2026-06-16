'use server'

import { db } from '@/db'
import { tasks } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/enterprise/auth'
import { requirePermission } from '@/lib/enterprise/rbac'

interface CreateTaskInput {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string | null
  lead_id?: string | null
  deal_id?: string | null
  assigned_to?: string | null
}

export async function createTaskAction(data: CreateTaskInput) {
  try {
    const session = await requireSession()
    requirePermission(session, 'tasks', 'write')

    // Assign to the user creating the task if not explicitly assigned
    const assignee = data.assigned_to || session.userId

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
      dueDate: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : null,
      assignedTo: assignee,
      createdBy: session.userId,
      entityType: entityType,
      entityId: entityId,
      status: 'open',
    } as any).returning()

    revalidatePath('/dashboard/tasks')
    if (data.lead_id) revalidatePath(`/dashboard/leads`)
    if (data.deal_id) revalidatePath(`/dashboard/deals`)

    return { data: { ...task, assigned_to: task?.assignedTo }, error: null }
  } catch (error: any) {
    console.error('Create task error:', error)
    return { data: null, error: error.message }
  }
}
