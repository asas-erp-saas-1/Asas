import React from 'react';
import { Metadata } from 'next';
import { AvailabilityMatrixModule } from '@/modules/dashboard/components/AvailabilityMatrixModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Availability Matrix — ASAS OS',
  description: 'Real Estate Inventory Visibility',
}

export default async function MatrixPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <AvailabilityMatrixModule />
    </div>
  );
}
