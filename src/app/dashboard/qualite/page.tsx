import React from 'react';
import { QualityControlModule } from '@/modules/dashboard/components/QualityControlModule';

export const dynamic = 'force-dynamic';

export default async function QualityPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <QualityControlModule />
    </div>
  );
}
