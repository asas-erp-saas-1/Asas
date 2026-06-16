import { db } from '@/db';
import { floorplans, projects } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class FloorplanService {
  static async createFloorplan(
    organizationId: string,
    data: { projectId: string; name: string; type?: string; totalAreaSqm?: number | string; internalAreaSqm?: number | string; balconyAreaSqm?: number | string; imageUrl?: string },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newFloorplan] = await tx.insert(floorplans).values({
        organizationId,
        ...data,
        totalAreaSqm: data.totalAreaSqm !== undefined ? String(data.totalAreaSqm) : null,
        internalAreaSqm: data.internalAreaSqm !== undefined ? String(data.internalAreaSqm) : null,
        balconyAreaSqm: data.balconyAreaSqm !== undefined ? String(data.balconyAreaSqm) : null,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_FLOORPLAN',
        entityType: 'floorplans',
        entityId: newFloorplan?.id || '',
        newData: data
      });

      return newFloorplan;
    });
  }

  static async listFloorplans(organizationId: string, projectId?: string) {
    let baseWhere = and(eq(floorplans.organizationId, organizationId), isNull(floorplans.deletedAt));
    if (projectId) {
      baseWhere = and(baseWhere, eq(floorplans.projectId, projectId));
    }

    return await db.select({
        id: floorplans.id,
        projectId: floorplans.projectId,
        name: floorplans.name,
        type: floorplans.type,
        totalAreaSqm: floorplans.totalAreaSqm,
        internalAreaSqm: floorplans.internalAreaSqm,
        balconyAreaSqm: floorplans.balconyAreaSqm,
        imageUrl: floorplans.imageUrl,
        project: {
            name: projects.name
        }
    })
    .from(floorplans)
    .leftJoin(projects, eq(floorplans.projectId, projects.id))
    .where(baseWhere);
  }
}
