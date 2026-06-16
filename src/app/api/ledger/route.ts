import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { LedgerEngine } from '@/lib/enterprise/ledger';
import { db } from '@/db';
import { journalEntries, ledgerLines, accounts, payments } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Finance read permission
    requirePermission(session, 'deals', 'read'); 

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    
    const orgId = session.organizationId;

    if (view === 'cash_position') {
      // Real balances from immutable ledger engine
      const cashBalance = await LedgerEngine.getAccountBalance(orgId, '512'); // Standard Algerian Bank Account
      const cashBox = await LedgerEngine.getAccountBalance(orgId, '53'); // Caisse
      
      const receivablesTotal = await LedgerEngine.getAccountBalance(orgId, '411'); // Clients
      const payablesTotal = await LedgerEngine.getAccountBalance(orgId, '401'); // Fournisseurs
      
      const totalCash = cashBalance + cashBox;
      const netPosition = totalCash - payablesTotal;
      const liquidityRatio = payablesTotal > 0 ? (totalCash + receivablesTotal) / payablesTotal : totalCash > 0 ? 999 : 0;
      
      return NextResponse.json({
        cashBalance: totalCash,
        receivablesTotal,
        payablesTotal,
        netPosition,
        liquidityRatio: liquidityRatio.toFixed(2),
        liquidityMode: liquidityRatio > 1.5 ? 'growth' : 'caution',
        survivalDaysLeft: totalCash > 0 ? Math.round(totalCash / 100000) : 0 // Rough mock est
      });
    }

    if (view === 'aging') {
      // Mock aging for now, but linked to real receivables
      const receivablesTotal = await LedgerEngine.getAccountBalance(orgId, '411'); 
      return NextResponse.json({
        totalOutstanding: { amount: receivablesTotal },
        buckets: [
          { label: '0-30', amount: { amount: receivablesTotal * 0.5 }, count: 12, pct: 50 },
          { label: '31-60', amount: { amount: receivablesTotal * 0.3 }, count: 5, pct: 30 },
          { label: '61-90', amount: { amount: receivablesTotal * 0.15 }, count: 3, pct: 15 },
          { label: '90+', amount: { amount: receivablesTotal * 0.05 }, count: 8, pct: 5 }
        ],
        collectionEfficiency: 0.85,
        overdueCount: 8
      });
    }

    if (view === 'journal') {
      const entries = await db.select()
         .from(journalEntries)
         .where(eq(journalEntries.organizationId, orgId))
         .orderBy(desc(journalEntries.entryDate), desc(journalEntries.createdAt))
         .limit(50);
      
      const allLines = await db.select({
         id: ledgerLines.id,
         journalEntryId: ledgerLines.journalEntryId,
         accountId: ledgerLines.accountId,
         direction: ledgerLines.direction,
         amount: ledgerLines.amount,
         accountName: accounts.name,
         accountCode: accounts.code
      })
      .from(ledgerLines)
      .innerJoin(accounts, eq(ledgerLines.accountId, accounts.id))
      .where(eq(ledgerLines.organizationId, orgId));

      const formattedEntries = entries.map(e => ({
         ...e,
         lines: allLines.filter(l => l.journalEntryId === e.id).map(l => ({
            account: { code: l.accountCode, name: l.accountName },
            transaction_type: l.direction,
            amount: Number(l.amount)
         }))
      }));

      return NextResponse.json({ entries: formattedEntries });
    }

    if (view === 'pnl') {
      const revenue = await LedgerEngine.getAccountBalance(orgId, '70'); // Comptes de Ventes
      const cogs = await LedgerEngine.getAccountBalance(orgId, '60'); // Achats Consommés
      const expenses = await LedgerEngine.getAccountBalance(orgId, '61') + await LedgerEngine.getAccountBalance(orgId, '62'); // Services Extérieurs

      const netIncome = revenue - cogs - expenses;
      const grossMargin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
      const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

      return NextResponse.json({
        revenue,
        cogs,
        grossProfit: revenue - cogs,
        grossMargin,
        expenses,
        netIncome,
        netMargin
      });
    }

    return NextResponse.json({ error: 'Unsupported view' }, { status: 400 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/ledger' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
