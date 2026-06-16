import React from 'react';
import { Metadata } from 'next';
import { GlobalInteractiveMap } from '@/modules/dashboard/components/GlobalInteractiveMap';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Interactive Map — ASAS OS',
  description: 'Geospatial Intelligence',
}

export default async function MapPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <GlobalInteractiveMap />
    </div>
  );
}
