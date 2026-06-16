import { db } from '@/db';
import { tasks, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class WorkflowService {
  static async createTask(
    organizationId: string,
    data: { title: string; description?: string; priority?: string; dueDate?: string; assignedTo?: string; entityType?: string; entityId?: string },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newTask] = await tx.insert(tasks).values({
        organizationId,
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_TASK',
        entityType: 'tasks',
        entityId: newTask?.id || '',
        newData: data
      });

      return newTask;
    });
  }

  static async listTasks(organizationId: string, assignedTo?: string) {
    let baseWhere = and(eq(tasks.organizationId, organizationId), isNull(tasks.deletedAt));
    if (assignedTo) {
      baseWhere = and(baseWhere, eq(tasks.assignedTo, assignedTo));
    }

    return await db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      entityType: tasks.entityType,
      entityId: tasks.entityId,
      assignedTo: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .where(baseWhere);
  }

  static async updateTaskStatus(organizationId: string, taskId: string, status: string, updatedBy: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(tasks)
        .set({ status, updatedAt: new Date(), updatedBy })
        .where(and(eq(tasks.id, taskId), eq(tasks.organizationId, organizationId)))
        .returning();

      if (!updated) {
        throw new Error('Task not found');
      }

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_TASK_STATUS',
        entityType: 'tasks',
        entityId: taskId,
        newData: { status }
      });

      return updated;
    });
  }
}
