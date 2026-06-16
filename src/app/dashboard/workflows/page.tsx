import React from 'react';
import { WorkflowEngineModule } from '@/modules/dashboard/components/WorkflowEngineModule';

export const dynamic = 'force-dynamic';

export default async function WorkflowsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <WorkflowEngineModule />
    </div>
  );
}
