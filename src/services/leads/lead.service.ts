import { db } from "@/db";
import { leads, contacts, opportunities, interactions } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { LeadStateMachine } from "@/core/stateMachine";
import { requireSession } from "@/lib/enterprise/auth";

export class LeadService {
  static async getLeads(limit = 50, offset = 0): Promise<any[]> {
    const session = await requireSession();
    const data = await db
      .select({
        id: leads.id,
        status: leads.status,
        source: leads.source,
        created_at: leads.createdAt,
        clients: {
          full_name: contacts.lastName,
          phone: contacts.phone,
        },
        profiles: {
          full_name: contacts.firstName,
        },
      })
      .from(leads)
      .leftJoin(contacts, eq(leads.contactId, contacts.id))
      .where(
        and(
          eq(leads.organizationId, session.organizationId),
          isNull(leads.deletedAt),
        ),
      )
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    return data;
  }

  static async createLead(data: {
    clientId: string;
    source?: string;
    budgetMin?: number;
    budgetMax?: number;
    assignedAgent?: string;
  }): Promise<any> {
    const session = await requireSession();

    const [lead] = await db
      .insert(leads)
      .values({
        organizationId: session.organizationId,
        contactId: data.clientId,
        source: data.source || null,
        assignedTo: data.assignedAgent || null,
        status: "new",
        createdBy: session.userId,
      })
      .returning();

    return {
      id: lead?.id,
      status: lead?.status,
      source: lead?.source,
      assigned_agent: lead?.assignedTo,
    };
  }

  static async assignLead(leadId: string, agentId: string): Promise<any> {
    const session = await requireSession();
    const [updated] = await db
      .update(leads)
      .set({ assignedTo: agentId })
      .where(
        and(
          eq(leads.id, leadId),
          eq(leads.organizationId, session.organizationId),
        ),
      )
      .returning();
    return updated;
  }

  static async updateStatus(
    leadId: string,
    status: string,
    metadata?: { lostReason?: string },
  ): Promise<any> {
    const session = await requireSession();

    const [leadRecord] = await db
      .select()
      .from(leads)
      .where(
        and(
          eq(leads.id, leadId),
          eq(leads.organizationId, session.organizationId),
          isNull(leads.deletedAt),
        ),
      )
      .limit(1);

    if (!leadRecord) {
      throw new Error(`Lead ${leadId} not found or permission denied.`);
    }

    const stateMachine = new LeadStateMachine(leadRecord.status || "new");
    const opt = metadata?.lostReason
      ? { lost_reason: metadata.lostReason }
      : {};
    const validation = stateMachine.validate(status as any, opt);
    if (!validation.ok) {
      throw new Error(
        validation.error ||
          `Invalid transition from ${leadRecord.status} to ${status}`,
      );
    }

    const [updated] = await db
      .update(leads)
      .set({ status })
      .where(eq(leads.id, leadId))
      .returning();

    await db.insert(interactions).values({
      organizationId: session.organizationId,
      contactId: leadRecord.contactId || session.userId,
      userId: session.userId,
      interactionDate: new Date(),
      type: "status_change",
      summary: `Lead status changed from ${leadRecord.status?.toUpperCase()} to ${status.toUpperCase()}.${
        metadata?.lostReason ? ` Reason: ${metadata.lostReason}` : ""
      }`,
      createdBy: session.userId,
    });

    return {
      id: updated?.id || leadId,
      status: updated?.status || status,
      source: updated?.source,
    };
  }

  static async deleteLead(leadId: string): Promise<void> {
    const session = await requireSession();
    await db
      .update(leads)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(leads.id, leadId),
          eq(leads.organizationId, session.organizationId),
        ),
      );
  }
}
