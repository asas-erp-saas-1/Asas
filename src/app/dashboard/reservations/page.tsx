import React from 'react';
import { Metadata } from 'next';
import { ReservationsGrid } from '@/modules/dashboard/components/ReservationsGrid';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reservations — ASAS OS',
  description: 'Manage property reservations and down payments',
}

export default async function ReservationsPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <ReservationsGrid />
    </div>
  );
}
