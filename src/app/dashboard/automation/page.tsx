import React from 'react';
import { Metadata } from 'next';
import { AutomationCenterModule } from '@/modules/dashboard/components/AutomationCenterModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Automation Center — ASAS OS',
  description: 'AI Workflows & RPA',
}

export default async function AutomationPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <AutomationCenterModule />
    </div>
  );
}
