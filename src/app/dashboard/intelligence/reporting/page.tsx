import React from 'react';
import { Metadata } from 'next';
import { ExecutiveReportingModule } from '@/modules/dashboard/components/ExecutiveReportingModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Executive Reporting — ASAS OS',
  description: 'Automated Board Reports & Synthesis',
}

export default async function ReportingPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <ExecutiveReportingModule />
    </div>
  );
}
