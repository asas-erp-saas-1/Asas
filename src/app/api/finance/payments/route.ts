import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, contracts, contacts, invoices } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { logAudit } from '@/lib/enterprise/audit';
import { LedgerEngine } from '@/lib/enterprise/ledger';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'finance', 'read');

    const list = await db.select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      paymentDate: payments.paymentDate,
      status: payments.status,
      method: payments.method,
      referenceCode: payments.referenceCode,
      contact: {
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        companyName: contacts.companyName
      },
      contract: {
        referenceCode: contracts.referenceCode
      }
    })
    .from(payments)
    .leftJoin(contacts, eq(payments.contactId, contacts.id))
    .leftJoin(contracts, eq(payments.contractId, contracts.id))
    .where(and(eq(payments.organizationId, session.organizationId), isNull(payments.deletedAt)));

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/finance/payments' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'finance', 'write');

    const body = await request.json();
    const { contractId, invoiceId, amount, method, referenceCode, notes } = body;

    if (!contractId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch Contract & ensure existence
    const contractList = await db.select().from(contracts)
        .where(and(eq(contracts.id, contractId), eq(contracts.organizationId, session.organizationId))).limit(1);
        
    if (contractList.length === 0) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    const contract = contractList[0];

    // 2. Post to Double Entry Ledger
    // For a Client Payment: Debit Bank (512), Credit Client Receivables (411)
    const ledgerEntry = await LedgerEngine.postEntry(
      session.organizationId,
      session.userId,
      referenceCode || `REC-${Date.now().toString().slice(-6)}`,
      `Paiement pour contrat ${contract?.referenceCode} - ${notes || ''}`,
      [
         { accountCode: '512', direction: 'debit', amount: Number(amount), description: 'Encaissement Banque' },
         { accountCode: '411', direction: 'credit', amount: Number(amount), description: 'Diminution Créance Client' },
      ]
    );

    // 3. Register standard Payment record linked to Ledger
    const [newPayment] = await db.insert(payments).values({
      organizationId: session.organizationId,
      contactId: contract?.contactId,
      contractId: contractId,
      invoiceId: invoiceId || null,
      journalEntryId: ledgerEntry?.id || '',
      referenceCode: referenceCode || `REC-${Date.now().toString().slice(-6)}`,
      method: method || 'bank_transfer',
      amount: String(amount),
      paymentDate: new Date(),
      status: 'completed',
      notes: notes,
      createdBy: session.userId,
    } as any).returning();

    // 4. Optionally Update Invoice Status if provided
    if (invoiceId) {
        await db.update(invoices).set({ status: 'paid', updatedAt: new Date() })
            .where(and(eq(invoices.id, invoiceId), eq(invoices.organizationId, session.organizationId)));
    }

    // 5. Audit
    await logAudit({
      organizationId: session.organizationId,
      userId: session.userId,
      action: 'PROCESS_PAYMENT',
      entityType: 'payments',
      entityId: newPayment?.id || '',
      newData: { amount, contractId }
    });

    return NextResponse.json({ data: newPayment }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/finance/payments' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
