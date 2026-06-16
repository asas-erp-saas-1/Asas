import React from 'react';
import { Metadata } from 'next';
import { PropertiesAnalyticsModule } from '@/modules/dashboard/components/PropertiesAnalyticsModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Properties Analytics — ASAS OS',
}

export default async function PropertiesAnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <PropertiesAnalyticsModule />
    </div>
  );
}
