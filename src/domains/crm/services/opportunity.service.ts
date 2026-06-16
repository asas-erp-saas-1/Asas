import { getTenantDb } from '@/db';
import { opportunities, contacts, leads, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class OpportunityService {
  static async createOpportunity(
    organizationId: string,
    data: {
      contactId: string;
      leadId?: string;
      assignedTo?: string;
      stage?: string;
      estimatedValue?: number | string;
      probability?: number;
      expectedCloseDate?: string;
    },
    createdBy: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [newOpportunity] = await tx.insert(opportunities).values({
        organizationId,
        ...data,
        estimatedValue: data.estimatedValue !== undefined ? String(data.estimatedValue) : undefined,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate).toISOString().split('T')[0] : undefined,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_OPPORTUNITY',
        entityType: 'opportunities',
        entityId: newOpportunity?.id || '',
        newData: data
      });

      return newOpportunity;
    });
  }

  static async listOpportunities(organizationId: string, stage?: string) {
    let baseWhere = and(eq(opportunities.organizationId, organizationId), isNull(opportunities.deletedAt));
    if (stage) {
      baseWhere = and(baseWhere, eq(opportunities.stage, stage));
    }

    return await getTenantDb(organizationId).select({
      id: opportunities.id,
      stage: opportunities.stage,
      estimatedValue: opportunities.estimatedValue,
      probability: opportunities.probability,
      expectedCloseDate: opportunities.expectedCloseDate,
      createdAt: opportunities.createdAt,
      contact: {
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        companyName: contacts.companyName
      },
      assignedTo: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(opportunities)
    .leftJoin(contacts, eq(opportunities.contactId, contacts.id))
    .leftJoin(users, eq(opportunities.assignedTo, users.id))
    .where(baseWhere);
  }

  static async updateOpportunityStage(organizationId: string, opportunityId: string, stage: string, updatedBy: string) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [updated] = await tx.update(opportunities)
        .set({ stage, updatedAt: new Date(), updatedBy })
        .where(and(eq(opportunities.id, opportunityId), eq(opportunities.organizationId, organizationId)))
        .returning();

      if (!updated) {
        throw new Error('Opportunity not found');
      }

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_OPPORTUNITY_STAGE',
        entityType: 'opportunities',
        entityId: opportunityId,
        newData: { stage }
      });

      return updated;
    });
  }
}
