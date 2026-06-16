import React from 'react';
import { Metadata } from 'next';
import { CEOIntelligenceRoom } from '@/modules/dashboard/components/CEOIntelligenceRoom';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CEO Intelligence Room — ASAS OS',
  description: 'Executive Command and Strategic Intelligence',
}

export default async function IntelligencePage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <CEOIntelligenceRoom />
    </div>
  );
}
