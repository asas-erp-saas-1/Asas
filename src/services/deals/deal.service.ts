import { db } from "@/db";
import {
  contracts,
  contacts,
  units,
  projects,
  installments,
  interactions,
} from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import { DealStateMachine, DEAL_TRANSITION_META } from "@/core/stateMachine";
import { requireSession } from "@/lib/enterprise/auth";

export class DealService {
  static async getDeals(): Promise<any[]> {
    const session = await requireSession();

    // Note: Return type is left as any[] to match legacy 'Deal' expectation on UI until UI is updated
    const data = await db
      .select({
        id: contracts.id,
        reference: contracts.referenceCode,
        status: contracts.status,
        agreed_price: contracts.agreedPrice,
        deal_type: contracts.status,
        created_at: contracts.createdAt,
        clients: {
          full_name: contacts.lastName,
          phone: contacts.phone,
        },
        profiles: {
          full_name: contacts.firstName,
        },
        propertiesId: units.id,
        propertiesRef: units.referenceCode,
        buildingId: units.buildingId,
      })
      .from(contracts)
      .leftJoin(contacts, eq(contracts.contactId, contacts.id))
      .leftJoin(units, eq(contracts.unitId, units.id))
      .where(
        and(
          eq(contracts.organizationId, session.organizationId),
          isNull(contracts.deletedAt),
        ),
      )
      .orderBy(desc(contracts.createdAt));

    return data.map(d => ({
       id: d.id,
       reference: d.reference,
       status: d.status,
       agreed_price: d.agreed_price,
       deal_type: d.deal_type,
       clients: d.clients,
       profiles: d.profiles,
       properties: {
          id: d.propertiesId,
          reference_code: d.propertiesRef,
          projects: {
             id: d.buildingId,
             name: d.propertiesRef
          }
       }
    }));
  }

  static async createDeal(data: {
    clientId: string;
    propertyId: string;
    agreedPrice: number;
    dealType: string;
    leadId?: string;
    agentId?: string;
  }): Promise<any> {
    const session = await requireSession();
    const reference = `CTR-${Date.now().toString().slice(-6)}`;

    const [contract] = await db
      .insert(contracts)
      .values({
        organizationId: session.organizationId,
        contactId: data.clientId,
        unitId: data.propertyId,
        referenceCode: reference,
        status: "draft",
        agreedPrice: String(data.agreedPrice),
        createdBy: session.userId,
      })
      .returning();

    if (data.leadId) {
      await db.insert(interactions).values({
        organizationId: session.organizationId,
        contactId: data.clientId, 
        userId: session.userId,
        type: "call",
        interactionDate: new Date(),
        summary:
          "Dossier Vente (Deal) créé. Statut de la piste modifié à Réservé.",
        createdBy: session.userId,
      });
    }

    return {
      id: contract?.id || null,
      status: contract?.status || "draft",
      reference: contract?.referenceCode,
      agreed_price: contract?.agreedPrice,
    };
  }

  static async changeDealStatus(
    dealId: string,
    status: string,
    currentVersion: number = 1,
    metadata?: { lostReason?: string },
  ): Promise<any> {
    const session = await requireSession();

    const [contract] = await db
      .select()
      .from(contracts)
      .where(
        and(
          eq(contracts.id, dealId),
          eq(contracts.organizationId, session.organizationId),
        ),
      )
      .limit(1);

    if (!contract) {
      throw new Error(
        `Deal (Contract) ${dealId} not found or permission denied.`,
      );
    }

    const stateMachine = new DealStateMachine((contract.status || "draft") as any);
    const validation = stateMachine.validate(status as any);
    if (!validation.ok) {
      throw new Error(
        validation.error ||
          `Invalid transition from ${contract.status} to ${status}`,
      );
    }

    const [updated] = await db
      .update(contracts)
      .set({ status: status })
      .where(eq(contracts.id, dealId))
      .returning();

    // Note: Cancel payments etc can be handled here on installments table if needed

    return {
      id: updated?.id || null,
      status: updated?.status || status,
      reference: updated?.referenceCode,
      agreed_price: updated?.agreedPrice,
    };
  }

  static async registerPayment(
    dealId: string,
    amount: number,
    dueDate: string,
  ) {
    const session = await requireSession();
    const [inst] = await db
      .insert(installments)
      .values({
        organizationId: session.organizationId,
        contractId: dealId,
        name: "Auto Generated Installment",
        amount: String(amount),
        dueDate: new Date(dueDate).toISOString(),
        status: "pending",
      })
      .returning();
    return inst;
  }
}
