import { getTenantDb } from '@/db';
import { interactions } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class InteractionService {
  static async createInteraction(
    organizationId: string,
    data: { contactId: string; opportunityId?: string; type: string; interactionDate: string; summary?: string; outcome?: string },
    userId: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const [newInteraction] = await tx.insert(interactions).values({
        organizationId,
        userId,
        contactId: data.contactId,
        opportunityId: data.opportunityId,
        type: data.type,
        interactionDate: new Date(data.interactionDate),
        summary: data.summary,
        outcome: data.outcome,
        createdBy: userId
      }).returning();

      await logAudit({
        organizationId,
        userId,
        action: 'CREATE_INTERACTION',
        entityType: 'interactions',
        entityId: newInteraction?.id || '',
        newData: data
      });

      return newInteraction;
    });
  }

  static async listInteractionsByContact(organizationId: string, contactId: string) {
    return await getTenantDb(organizationId).select()
      .from(interactions)
      .where(and(eq(interactions.organizationId, organizationId), eq(interactions.contactId, contactId), isNull(interactions.deletedAt)));
  }
}
