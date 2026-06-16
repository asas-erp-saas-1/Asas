import React from 'react';
import { Metadata } from 'next';
import { SecurityCenterModule } from '@/modules/dashboard/components/SecurityCenterModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Security Center — ASAS OS',
}

export default async function SecurityPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <SecurityCenterModule />
    </div>
  );
}
