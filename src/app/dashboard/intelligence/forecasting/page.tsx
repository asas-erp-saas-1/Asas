import React from 'react';
import { Metadata } from 'next';
import { StrategicForecastingModule } from '@/modules/dashboard/components/StrategicForecastingModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Strategic Forecasting — ASAS OS',
  description: 'AI Predictive Engine & Flow Analysis',
}

export default async function ForecastingPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <StrategicForecastingModule />
    </div>
  );
}
