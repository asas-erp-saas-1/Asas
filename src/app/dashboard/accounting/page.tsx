import React from "react";
import { Metadata } from "next";
import { AccountingLedger } from "@/modules/dashboard/components/AccountingLedger";
import { requireSession } from "@/lib/enterprise/auth";
import { db } from "@/db";
import { journalEntries, ledgerLines, accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accounting Ledger — ASAS OS",
  description: "Oracle ERP Logic - Comptabilité Générale",
};

export default async function AccountingPage() {
  const session = await requireSession();

  const entriesRaw = await db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.organizationId, session.organizationId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(50);

  const entriesWithLines = await Promise.all(
    entriesRaw.map(async (entry) => {
      const lines = await db
        .select({
          id: ledgerLines.id,
          direction: ledgerLines.direction,
          amount: ledgerLines.amount,
          description: ledgerLines.description,
          account: {
            code: accounts.code,
            name: accounts.name,
          },
        })
        .from(ledgerLines)
        .innerJoin(accounts, eq(ledgerLines.accountId, accounts.id))
        .where(eq(ledgerLines.journalEntryId, entry.id));

      return {
        ...entry,
        lines,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <AccountingLedger initialEntries={entriesWithLines as any} />
    </div>
  );
}
