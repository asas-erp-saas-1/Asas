import React from 'react';
import { Metadata } from 'next';
import { PerformanceReviewsModule } from '@/modules/dashboard/components/PerformanceReviewsModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Performance Reviews — ASAS OS',
}

export default async function PerformancePage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <PerformanceReviewsModule />
    </div>
  );
}
