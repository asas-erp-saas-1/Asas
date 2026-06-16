// src/app/api/command-gateway/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  contacts,
  contracts,
  units,
  installments,
  interactions,
  commissions,
  journalEntries,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireSession } from "@/lib/enterprise/auth";
import { ErrorTracker } from "@/lib/observability/errors";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const command = await request.json();

    if (command.type === "CREATE_CLIENT") {
      const { full_name, phone, email, type, source, nationality } =
        command.payload;
      const [client] = await db
        .insert(contacts)
        .values({
          organizationId: session.organizationId,
          firstName: full_name?.split(" ")[0] || "",
          lastName: full_name?.split(" ").slice(1).join(" ") || full_name || "",
          phone: phone || null,
          email: email || null,
          type: type || "buyer",
          source: source || "other",
          createdBy: session.userId,
        } as any)
        .returning();
      return NextResponse.json({ success: true, data: client });
    }

    if (command.type === "SET_DEAL_STAGE") {
      const { stage, notes, lostReason } = command.payload;
      const { DealService } = await import("@/services/deals/deal.service");
      const deal = await DealService.changeDealStatus(
        command.aggregateId,
        stage,
        command.expectedVersion || 1,
        { lostReason: lostReason || notes },
      );
      return NextResponse.json({ success: true, data: deal });
    }

    if (command.type === "SET_LEAD_STATUS") {
      const { status, lostReason } = command.payload;
      const { LeadService } = await import("@/services/leads/lead.service");
      const lead = await LeadService.updateStatus(command.aggregateId, status, {
        lostReason,
      });
      return NextResponse.json({ success: true, data: lead });
    }

    if (command.type === "UPDATE_PROPERTY_STATUS") {
      const { status } = command.payload;
      const [prop] = await db
        .update(units)
        .set({ status })
        .where(eq(units.id, command.aggregateId))
        .returning();
      return NextResponse.json({ success: true, data: prop });
    }

    if (command.type === "CREATE_DEAL") {
      const { client_id, property_id, agreed_price, deal_type, agent_id } =
        command.payload;
      const { DealService } = await import("@/services/deals/deal.service");
      const deal = await DealService.createDeal({
        clientId: client_id,
        propertyId: property_id,
        agreedPrice: Number(agreed_price),
        dealType: deal_type || "sale",
        agentId: agent_id,
      });
      await db
        .update(units)
        .set({ status: "reserved" })
        .where(eq(units.id, property_id));
      return NextResponse.json({ success: true, data: deal });
    }

    if (command.type === "LOG_DEPOSIT") {
      const { amount, method, notes } = command.payload;
      const [payment] = await db
        .insert(installments)
        .values({
          organizationId: session.organizationId,
          contractId: command.aggregateId,
          name: "Deposit Payment",
          amount: String(amount),
          status: "pending",
          dueDate: new Date().toISOString(),
        } as any)
        .returning();
      return NextResponse.json({ success: true, data: payment });
    }

    if (command.type === "SCHEDULE_PAYMENT") {
      const { dealId, amount, due_date, notes } = command.payload;
      const [payment] = await db
        .insert(installments)
        .values({
          organizationId: session.organizationId,
          contractId: dealId || command.aggregateId,
          name: notes || "Scheduled Payment",
          amount: String(amount),
          dueDate: due_date,
          status: "pending",
        } as any)
        .returning();
      return NextResponse.json({ success: true, data: payment });
    }

    if (command.type === "TRIGGER_PROJECT_TRANCHE") {
      const { projectId, trancheLabel, tranchePct } = command.payload;
      const { DealService } = await import("@/services/deals/deal.service");
      const allDeals = await DealService.getDeals();
      const projectDeals = allDeals.filter(
        (d: any) =>
          d.properties?.projects?.id === projectId &&
          ["active", "negotiation", "notary", "closed"].includes(d.status),
      );

      for (const deal of projectDeals) {
        const agreedPrice =
          (deal as any).agreed_price || (deal as any).amount || 0;
        const amountToCall = agreedPrice * (tranchePct / 100);

        await DealService.registerPayment(
          deal.id,
          amountToCall,
          new Date().toISOString(),
        );

        await db.insert(interactions).values({
          organizationId: session.organizationId,
          contactId: deal.clients?.id || session.userId,
          type: "note",
          createdBy: session.userId,
          notes: `Appel de fonds émis : ${trancheLabel} (${tranchePct}% = ${amountToCall.toLocaleString()} DZD)`,
        } as any);
      }

      return NextResponse.json({
        success: true,
        dispatched: projectDeals.length,
      });
    }

    if (command.type === "MARK_PAYMENT_PAID") {
      const { dealId, amount } = command.payload;

      const [payment] = await db
        .update(installments)
        .set({ status: "paid" })
        .where(eq(installments.id, command.aggregateId))
        .returning();

      // Interactions
      await db.insert(interactions).values({
        organizationId: session.organizationId,
        contactId: session.userId,
        type: "status_change",
        createdBy: session.userId,
        notes: `Paiement / Appel de fonds validé: ${(amount / 1000000).toFixed(2)}M DZD - Validé via espace Intelligence`,
      } as any);

      return NextResponse.json({ success: true, data: payment });
    }

    if (command.type === "POST_JOURNAL_ENTRY") {
      const { LedgerEngine } = await import("@/lib/enterprise/ledger");
      const { description, lines } = command.payload;
      const ref = `JRN-${Date.now()}`;

      const entry = await LedgerEngine.postEntry(
        session.organizationId,
        session.userId,
        ref,
        description || "Manual Journal Entry",
        lines,
      );

      return NextResponse.json({ success: true, data: entry });
    }

    if (command.type === "SETTLE_COMMISSION") {
      const { agreementId, amount, agentId } = command.payload;
      const [payment] = await db
        .insert(commissions)
        .values({
          organizationId: session.organizationId,
          dealId: agreementId,
          agentId: agentId,
          amount: String(amount),
          status: "paid",
        } as any)
        .returning();
      return NextResponse.json({ success: true, data: payment });
    }

    if (command.type === "LOG_EXPENSE") {
      const { category, amount, description, expense_date } = command.payload;
      const [expense] = await db
        .insert(journalEntries)
        .values({
          organizationId: session.organizationId,
          entryNumber: `EXP-${Date.now()}`,
          entryDate: expense_date || new Date().toISOString(),
          description: description || category,
          status: "posted",
          createdBy: session.userId,
        } as any)
        .returning();
      return NextResponse.json({ success: true, data: expense });
    }

    return NextResponse.json(
      { error: "Unknown command type" },
      { status: 400 },
    );
  } catch (error: any) {
    ErrorTracker.captureError(error, { context: "CommandGateway" });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
