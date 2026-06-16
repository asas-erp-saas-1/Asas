import React from 'react';
import { Metadata } from 'next';
import { ApiIntegrationsModule } from '@/modules/dashboard/components/ApiIntegrationsModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'API & Integrations — ASAS OS',
}

export default async function ApiPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <ApiIntegrationsModule />
    </div>
  );
}
