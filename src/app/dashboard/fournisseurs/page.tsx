import React from 'react';
import { ContractorsModule } from '@/modules/dashboard/components/ContractorsModule';

export const dynamic = 'force-dynamic';

export default async function ContractorsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <ContractorsModule />
    </div>
  );
}
