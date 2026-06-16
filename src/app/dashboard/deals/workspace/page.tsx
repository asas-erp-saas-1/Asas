import React from 'react';
import { Metadata } from 'next';
import { NegotiationWorkspaceModule } from '@/modules/dashboard/components/NegotiationWorkspaceModule';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Negotiation Workspace — ASAS OS',
}

export default async function DealRoomPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 h-full">
      <NegotiationWorkspaceModule />
    </div>
  );
}
