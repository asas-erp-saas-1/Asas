import { db } from '@/db';
import { organizations, settings } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class OrganizationService {
  static async getCurrentOrganization(organizationId: string) {
    const org = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
    return org[0] || null;
  }

  static async updateOrganization(organizationId: string, data: { name?: string; domain?: string; subscriptionStatus?: string }, updatedBy: string) {
    return await db.transaction(async (tx) => {
       const [updated] = await tx.update(organizations)
         .set({ ...data, updatedAt: new Date() })
         .where(eq(organizations.id, organizationId))
         .returning();

       await logAudit({
         organizationId,
         userId: updatedBy,
         action: 'UPDATE_ORGANIZATION',
         entityType: 'organizations',
         entityId: organizationId,
         newData: data
       });

       return updated;
    });
  }

  static async getSettings(organizationId: string, groupName?: string) {
    if (groupName) {
      return await db.select().from(settings).where(
        and(eq(settings.organizationId, organizationId), eq(settings.groupName, groupName))
      );
    }
    return await db.select().from(settings).where(eq(settings.organizationId, organizationId));
  }

  static async updateSetting(organizationId: string, groupName: string, key: string, value: any, updatedBy: string) {
    return await db.transaction(async (tx) => {
       const [existing] = await tx.select().from(settings).where(and(eq(settings.organizationId, organizationId), eq(settings.groupName, groupName), eq(settings.key, key))).limit(1);
       
       let result;
       if (existing) {
         [result] = await tx.update(settings)
           .set({ value, updatedAt: new Date() })
           .where(eq(settings.id, existing.id))
           .returning();
       } else {
         [result] = await tx.insert(settings)
           .values({ organizationId, groupName, key, value })
           .returning();
       }

       await logAudit({
         organizationId,
         userId: updatedBy,
         action: 'UPDATE_SETTING',
         entityType: 'settings',
         entityId: result?.id || '',
         newData: { groupName, key, value }
       });

       return result;
    });
  }
}
