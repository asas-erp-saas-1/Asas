import React from 'react';
import { Metadata } from 'next';
import { SalesAnalyticsModule } from '@/modules/dashboard/components/SalesAnalyticsModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sales Analytics — ASAS OS',
}

export default async function SalesAnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <SalesAnalyticsModule />
    </div>
  );
}
