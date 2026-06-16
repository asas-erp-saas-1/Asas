import { getTenantDb } from '@/db';
import { accounts, journalEntries, ledgerLines } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export interface LedgerLineEntry {
  accountCode: string;
  direction: 'debit' | 'credit';
  amount: number;
  description?: string;
}

export class LedgerEngine {
  /**
   * Posts a double-entry journal entry.
   * Ensures debits = credits.
   */
  static async postEntry(
    organizationId: string,
    userId: string,
    referenceCode: string,
    description: string,
    lines: LedgerLineEntry[],
    date: Date = new Date()
  ) {
    if (!lines || lines.length === 0) {
      throw new Error('Ledger entry must contain lines.');
    }

    const debits = lines.filter(l => l.direction === 'debit').reduce((acc, l) => acc + l.amount, 0);
    const credits = lines.filter(l => l.direction === 'credit').reduce((acc, l) => acc + l.amount, 0);

    // Using a tolerance for floats
    if (Math.abs(debits - credits) > 0.01) {
      throw new Error(`Double-entry balance failed: Debits (${debits}) do not equal Credits (${credits}).`);
    }

    const tenantDb = getTenantDb(organizationId);

    // Process inside a transaction
    return await tenantDb.transaction(async (tx) => {
      // 1. Create Journal Entry
      const [entry] = await tx.insert(journalEntries).values({
        organizationId,
        referenceCode,
        description,
        entryDate: date.toISOString().split('T')[0],
        status: 'posted',
        createdBy: userId,
      } as any).returning();

      // 2. Fetch required accounts
      const accountCodes = lines.map(l => l.accountCode);
      const accs = await tx.select().from(accounts).where(eq(accounts.organizationId, organizationId));
      
      const accsMap = new Map(accs.map(a => [a.code, a.id]));
      
      // Auto-create basic accounts if missing (Optional based on business rule, but helpful for bootstrapping)
      for (const code of accountCodes) {
         if (!accsMap.has(code)) {
            const [newAcc] = await tx.insert(accounts).values({
               organizationId,
               code,
               name: `Account ${code}`,
               type: code.startsWith('4') || code.startsWith('5') ? 'asset' : 'expense'
            }).returning();
            if (newAcc) accsMap.set(code, newAcc.id);
         }
      }

      // 3. Post lines
      const linesToInsert = lines.map(l => ({
        organizationId,
        journalEntryId: entry?.id || 'error',
        accountId: accsMap.get(l.accountCode)!,
        direction: l.direction,
        amount: String(l.amount),
        description: l.description,
        createdBy: userId,
      }));

      await tx.insert(ledgerLines).values(linesToInsert);

      // 4. Audit
      await logAudit({
        organizationId: organizationId as string,
        userId: userId as string,
        action: 'POST_JOURNAL_ENTRY',
        entityType: 'journalEntries',
        entityId: entry?.id || '',
        newData: { referenceCode, totalAmount: debits }
      });

      return entry;
    });
  }

  /**
   * Retrieves the current balance of an account or account group.
   */
  static async getAccountBalance(organizationId: string, accountCodePrefix: string): Promise<number> {
    const tenantDb = getTenantDb(organizationId);
    const rows = await tenantDb
      .select({
        code: accounts.code,
        type: accounts.type,
        direction: ledgerLines.direction,
        amount: ledgerLines.amount,
      })
      .from(ledgerLines)
      .innerJoin(accounts, eq(ledgerLines.accountId, accounts.id))
      .where(
         sql`${ledgerLines.organizationId} = ${organizationId} AND ${accounts.code} LIKE ${accountCodePrefix + '%'}`
      );

    let balance = 0;
    for (const row of rows) {
      const amt = Number(row.amount);
      const isAssetOrExpense = row.type === 'asset' || row.type === 'expense';
      
      if (isAssetOrExpense) {
        balance += row.direction === 'debit' ? amt : -amt;
      } else {
        balance += row.direction === 'credit' ? amt : -amt;
      }
    }

    return balance;
  }
}
