import React from 'react';
import { Metadata } from 'next';
import { TenantManagementModule } from '@/modules/dashboard/components/TenantManagementModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tenant Management — ASAS OS',
}

export default async function TenantsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <TenantManagementModule />
    </div>
  );
}
