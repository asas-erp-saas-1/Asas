import { getTenantDb } from '@/db';
import { contacts } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class ContactService {
  static async createContact(
    organizationId: string,
    data: {
      type?: string;
      firstName?: string;
      lastName?: string;
      companyName?: string;
      email?: string;
      phone?: string;
      nationalId?: string;
      address?: string;
    },
    createdBy: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [newContact] = await tx.insert(contacts).values({
        organizationId,
        ...data,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_CONTACT',
        entityType: 'contacts',
        entityId: newContact?.id || '',
        newData: data
      });

      return newContact;
    });
  }

  static async listContacts(organizationId: string, type?: string) {
    let baseWhere = and(eq(contacts.organizationId, organizationId), isNull(contacts.deletedAt));
    if (type) {
      baseWhere = and(baseWhere, eq(contacts.type, type));
    }

    return await getTenantDb(organizationId).select()
      .from(contacts)
      .where(baseWhere);
  }

  static async updateContact(organizationId: string, contactId: string, data: Partial<typeof contacts.$inferInsert>, updatedBy: string) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [updated] = await tx.update(contacts)
        .set({ ...data, updatedAt: new Date(), updatedBy })
        .where(and(eq(contacts.id, contactId), eq(contacts.organizationId, organizationId)))
        .returning();

      if (!updated) {
        throw new Error('Contact not found');
      }

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_CONTACT',
        entityType: 'contacts',
        entityId: contactId,
        newData: data
      });

      return updated;
    });
  }
}
