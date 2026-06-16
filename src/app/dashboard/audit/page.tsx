import React from 'react';
import { AuditLogsModule } from '@/modules/dashboard/components/AuditLogsModule';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <AuditLogsModule />
    </div>
  );
}
