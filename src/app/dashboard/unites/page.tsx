import React from 'react';
import { Metadata } from 'next';
import { UnitManagement } from '@/modules/dashboard/components/UnitManagement';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Unit Management — ASAS OS',
  description: 'Manage individual property units',
}

export default async function UnitesPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <UnitManagement />
    </div>
  );
}
