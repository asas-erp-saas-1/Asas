import { getTenantDb } from '@/db';
import { leads, contacts, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class LeadService {
  static async createLead(
    organizationId: string,
    data: {
      contactId?: string;
      campaignId?: string;
      assignedTo?: string;
      status?: string;
      source?: string;
      interestLevel?: string;
      notes?: string;
    },
    createdBy: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [newLead] = await tx.insert(leads).values({
        organizationId,
        ...data,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_LEAD',
        entityType: 'leads',
        entityId: newLead?.id || '',
        newData: data
      });

      return newLead;
    });
  }

  static async listLeads(organizationId: string, status?: string) {
    let baseWhere = and(eq(leads.organizationId, organizationId), isNull(leads.deletedAt));
    if (status) {
      baseWhere = and(baseWhere, eq(leads.status, status));
    }

    return await getTenantDb(organizationId).select({
      id: leads.id,
      status: leads.status,
      source: leads.source,
      interestLevel: leads.interestLevel,
      notes: leads.notes,
      createdAt: leads.createdAt,
      contact: {
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        companyName: contacts.companyName,
        email: contacts.email,
        phone: contacts.phone
      },
      assignedTo: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(leads)
    .leftJoin(contacts, eq(leads.contactId, contacts.id))
    .leftJoin(users, eq(leads.assignedTo, users.id))
    .where(baseWhere);
  }

  static async updateLeadStatus(organizationId: string, leadId: string, status: string, updatedBy: string) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [updated] = await tx.update(leads)
        .set({ status, updatedAt: new Date(), updatedBy })
        .where(and(eq(leads.id, leadId), eq(leads.organizationId, organizationId)))
        .returning();

      if (!updated) {
        throw new Error('Lead not found');
      }

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_LEAD_STATUS',
        entityType: 'leads',
        entityId: leadId,
        newData: { status }
      });

      return updated;
    });
  }
}
