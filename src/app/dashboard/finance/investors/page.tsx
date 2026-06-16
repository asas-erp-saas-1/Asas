import React from 'react';
import { Metadata } from 'next';
import { InvestorReportingModule } from '@/modules/dashboard/components/InvestorReportingModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Investor Reporting — ASAS OS',
  description: 'Investor Reports & Dividends',
}

export default async function InvestorReportingPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <InvestorReportingModule />
    </div>
  );
}
