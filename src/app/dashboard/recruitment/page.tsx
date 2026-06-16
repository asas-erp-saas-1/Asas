import React from 'react';
import { Metadata } from 'next';
import { RecruitmentModule } from '@/modules/dashboard/components/RecruitmentModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Recruitment Center — ASAS OS',
  description: 'Talent Acquisition & Pipeline',
}

export default async function RecruitmentPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <RecruitmentModule />
    </div>
  );
}
