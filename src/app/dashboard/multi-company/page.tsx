import React from 'react';
import { Metadata } from 'next';
import { MultiCompanyOverview } from '@/modules/dashboard/components/MultiCompanyOverview';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Multi-Company Overview — ASAS OS',
  description: 'ASAS Holding Enterprise Consolidation',
}

export default async function MultiCompanyPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <MultiCompanyOverview />
    </div>
  );
}
