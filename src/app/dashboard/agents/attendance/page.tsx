import React from 'react';
import { Metadata } from 'next';
import { AttendanceSystemModule } from '@/modules/dashboard/components/AttendanceSystemModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Attendance System — ASAS OS',
}

export default async function AttendancePage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <AttendanceSystemModule />
    </div>
  );
}
