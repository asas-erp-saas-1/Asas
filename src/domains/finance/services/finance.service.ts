import { getTenantDb } from '@/db';
import { invoices, installments, contracts } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';
import { LedgerEngine } from '@/lib/enterprise/ledger';

export class FinanceService {
  static async createInvoice(
    organizationId: string,
    data: { contactId: string; contractId?: string; installmentId?: string; referenceCode: string; amount: number | string; issueDate: string; dueDate: string },
    createdBy: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      // 1. Create Invoice
      const [newInvoice] = await tx.insert(invoices).values({
        organizationId,
        contactId: data.contactId,
        contractId: data.contractId || null,
        installmentId: data.installmentId || null,
        referenceCode: data.referenceCode,
        amount: String(data.amount),
        issueDate: new Date(data.issueDate).toISOString().split('T')[0],
        dueDate: new Date(data.dueDate).toISOString().split('T')[0],
        status: 'unpaid',
        createdBy
      } as any).returning();

      // 2. Ledger Post: Accrual entry (Debit Accounts Receivable (411), Credit Revenue (70))
      // Based on enterprise double-entry rules.
      await LedgerEngine.postEntry(
         organizationId,
         createdBy,
         data.referenceCode,
         `Facturation client - ${data.referenceCode}`,
         [
            { accountCode: '411', direction: 'debit', amount: Number(data.amount), description: 'Créance Client' },
            { accountCode: '708', direction: 'credit', amount: Number(data.amount), description: 'Produit des activités' },
         ]
      );

      // 3. Mark Installment as invoiced if applicable
      if (data.installmentId) {
        await tx.update(installments)
          .set({ status: 'invoiced', updatedAt: new Date(), updatedBy: createdBy })
          .where(eq(installments.id, data.installmentId));
      }

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_INVOICE',
        entityType: 'invoices',
        entityId: newInvoice?.id || '',
        newData: data
      });

      return newInvoice;
    });
  }

  static async listInvoices(organizationId: string) {
    return await getTenantDb(organizationId).select()
      .from(invoices)
      .where(and(eq(invoices.organizationId, organizationId), isNull(invoices.deletedAt)));
  }

  static async markInvoicePaid(organizationId: string, invoiceId: string, updatedBy: string) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const existing = await tx.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId))).limit(1).for('update');
      
      if (!existing.length) {
         throw new Error('Invoice not found');
      }

      if (existing[0]?.status === 'paid') {
          throw new Error('Invoice is already paid');
      }

      const [updated] = await tx.update(invoices)
        .set({ status: 'paid', updatedAt: new Date(), updatedBy })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, organizationId)))
        .returning();

      if (updated?.installmentId) {
        await tx.update(installments)
           .set({ status: 'paid', updatedAt: new Date(), updatedBy })
           .where(eq(installments.id, updated.installmentId));
      }

      if (updated) {
        // Ledger Post: Payment received (Debit Treasury (512), Credit Accounts Receivable (411))
        await LedgerEngine.postEntry(
           organizationId,
           updatedBy,
           `PAY-${updated.referenceCode}`,
           `Règlement facture - ${updated.referenceCode}`,
           [
              { accountCode: '512', direction: 'debit', amount: Number(updated.amount), description: 'Banque - Encaissement' },
              { accountCode: '411', direction: 'credit', amount: Number(updated.amount), description: 'Soldes Créance Client' },
           ]
        );
      }

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'MARK_INVOICE_PAID',
        entityType: 'invoices',
        entityId: invoiceId,
        newData: { status: 'paid' }
      });

      return updated;
    });
  }
}
