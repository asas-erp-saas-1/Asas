import { db } from '@/db';
import { buildings, projects } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class BuildingService {
  static async createBuilding(
    organizationId: string,
    data: { projectId: string; name: string; referenceCode?: string; type?: string; totalFloors?: number; status?: string; handoverDate?: string },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newBuilding] = await tx.insert(buildings).values({
        organizationId,
        ...data,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_BUILDING',
        entityType: 'buildings',
        entityId: newBuilding?.id || '',
        newData: data
      });

      return newBuilding;
    });
  }

  static async listBuildings(organizationId: string, projectId?: string) {
    let baseWhere = and(eq(buildings.organizationId, organizationId), isNull(buildings.deletedAt));
    if (projectId) {
      baseWhere = and(baseWhere, eq(buildings.projectId, projectId));
    }

    return await db.select({
        id: buildings.id,
        projectId: buildings.projectId,
        name: buildings.name,
        referenceCode: buildings.referenceCode,
        type: buildings.type,
        totalFloors: buildings.totalFloors,
        status: buildings.status,
        handoverDate: buildings.handoverDate,
        project: {
            name: projects.name
        }
    })
    .from(buildings)
    .leftJoin(projects, eq(buildings.projectId, projects.id))
    .where(baseWhere);
  }
}
