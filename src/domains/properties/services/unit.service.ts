import { getTenantDb } from '@/db';
import { units, buildings, floorplans } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class UnitService {
  static async createUnit(
    organizationId: string,
    data: { buildingId?: string; floorplanId?: string; referenceCode: string; status?: string; floor?: number; areaSqm?: number | string; basePrice?: number | string; metadata?: any },
    createdBy: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [newUnit] = await tx.insert(units).values({
        organizationId,
        ...data,
        areaSqm: data.areaSqm !== undefined ? String(data.areaSqm) : null,
        basePrice: data.basePrice !== undefined ? String(data.basePrice) : null,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_UNIT',
        entityType: 'units',
        entityId: newUnit?.id || '',
        newData: data
      });

      return newUnit;
    });
  }

  static async listUnits(organizationId: string, buildingId?: string) {
    let baseWhere = and(eq(units.organizationId, organizationId), isNull(units.deletedAt));
    if (buildingId) {
      baseWhere = and(baseWhere, eq(units.buildingId, buildingId));
    }

    return await getTenantDb(organizationId).select({
      id: units.id,
      buildingId: units.buildingId,
      floorplanId: units.floorplanId,
      referenceCode: units.referenceCode,
      status: units.status,
      floor: units.floor,
      areaSqm: units.areaSqm,
      basePrice: units.basePrice,
      building: {
        name: buildings.name
      },
      floorplan: {
        name: floorplans.name,
        type: floorplans.type
      }
    })
    .from(units)
    .leftJoin(buildings, eq(units.buildingId, buildings.id))
    .leftJoin(floorplans, eq(units.floorplanId, floorplans.id))
    .where(baseWhere);
  }

  static async updateUnitStatus(organizationId: string, unitId: string, status: string, updatedBy: string) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [updated] = await tx.update(units)
        .set({ status, updatedAt: new Date(), updatedBy })
        .where(and(eq(units.id, unitId), eq(units.organizationId, organizationId)))
        .returning();

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_UNIT_STATUS',
        entityType: 'units',
        entityId: unitId,
        newData: { status }
      });

      return updated;
    });
  }
}
