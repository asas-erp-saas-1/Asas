import React from 'react';
import { WorksitesModule } from '@/modules/dashboard/components/WorksitesModule';

export const dynamic = 'force-dynamic';

export default async function ChantiersPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <WorksitesModule />
    </div>
  );
}
