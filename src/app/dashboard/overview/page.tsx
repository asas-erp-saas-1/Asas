import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { kernel } from '@/lib/kernel/core';
import { redirect } from 'next/navigation';
import { CommandCenterGlobal } from '@/modules/dashboard/components/CommandCenterGlobal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Global Command Center V2 — ASAS OS',
  description: 'Enterprise Real Estate Operating System',
}

export default async function OverviewPage() {
  const supabase = await createClient();
  let identity;

  try {
    identity = await kernel.identity();
  } catch (error: any) {
    if (error?.message?.includes('Tenant isolation failure')) {
      redirect('/onboarding');
    } else {
      redirect('/login');
    }
  }

  // The actual production metrics will be wired here in the future
  return (
    <div className="flex flex-col gap-8 pb-10">
      <CommandCenterGlobal />
    </div>
  );
}
