import { db } from '@/db';
import { projects, projectMilestones, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class ProjectService {
  static async createProject(
    organizationId: string,
    data: { name: string; referenceCode?: string; description?: string; location?: string; status?: string; startDate?: string; expectedCompletionDate?: string; actualCompletionDate?: string; budget?: number | string; managerId?: string },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newProject] = await tx.insert(projects).values({
        organizationId,
        ...data,
        budget: data.budget !== undefined ? String(data.budget) : null,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_PROJECT',
        entityType: 'projects',
        entityId: newProject?.id || '',
        newData: data
      });

      return newProject;
    });
  }

  static async listProjects(organizationId: string) {
    return await db.select({
      id: projects.id,
      name: projects.name,
      referenceCode: projects.referenceCode,
      status: projects.status,
      startDate: projects.startDate,
      expectedCompletionDate: projects.expectedCompletionDate,
      budget: projects.budget,
      manager: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(projects)
    .leftJoin(users, eq(projects.managerId, users.id))
    .where(and(eq(projects.organizationId, organizationId), isNull(projects.deletedAt)));
  }

  static async updateProjectStatus(organizationId: string, projectId: string, status: string, updatedBy: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(projects)
        .set({ status, updatedAt: new Date(), updatedBy })
        .where(and(eq(projects.id, projectId), eq(projects.organizationId, organizationId)))
        .returning();

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_PROJECT_STATUS',
        entityType: 'projects',
        entityId: projectId,
        newData: { status }
      });

      return updated;
    });
  }
}
