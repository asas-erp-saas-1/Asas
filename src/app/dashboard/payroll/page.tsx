import React from 'react';
import { PayrollModule } from '@/modules/dashboard/components/PayrollModule';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <PayrollModule />
    </div>
  );
}
