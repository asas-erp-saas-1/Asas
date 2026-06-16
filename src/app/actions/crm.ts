'use server'

import { createClient } from '@/lib/supabase/server'
import { initializeEventKernel } from '@/lib/db/eventKernel'
import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/enterprise/auth'
import { requirePermission } from '@/lib/enterprise/rbac'

// Define our types
export type DealStage = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'CONTRACT_PENDING' | 'CLOSED_WON' | 'CANCELLED';

export interface DealWithClient {
  id: string;
  stage: DealStage;
  agreed_price: number;
  client: {
    first_name: string;
    last_name: string;
  };
}

export async function fetchActiveDeals(context?: string): Promise<DealWithClient[]> {
  const session = await requireSession();
  requirePermission(session, 'crm', 'read');

  const supabase = await createClient()

  // RLS inherently filters by the user's agency. 
  // We perform the query to fetch deals and their associated client data.
  const { data: deals, error } = await supabase
    .from('deals')
    .select(`
      id,
      stage,
      agreed_price,
      agency_id,
      client:clients (
        first_name,
        last_name
      )
    `)
    .eq('agency_id', session.organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch active deals:', error);
    throw new Error('Failed to fetch deals from database');
  }

  // Transform the response to match the DealWithClient interface
  return deals.map((d: any) => ({
    id: d.id,
    stage: d.stage,
    agreed_price: d.agreed_price,
    agency_id: d.agency_id,
    client: {
      first_name: d.client?.first_name || 'Unknown',
      last_name: d.client?.last_name || 'Client',
    }
  }));
}

export async function updateDealStage(dealId: string, newStage: DealStage, agencyId: string) {
  const session = await requireSession();
  requirePermission(session, 'crm', 'write');

  const supabase = await createClient()
  
  // 1. Get the current user to attribute the action
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch old state for the event bus
  const { data: oldDeal } = await supabase
    .from('deals')
    .select('stage')
    .eq('id', dealId)
    .single();

  // 3. Update the deal stage
  const { error: updateError } = await supabase
    .from('deals')
    .update({ stage: newStage })
    .eq('id', dealId)
    .eq('agency_id', session.organizationId);

  if (updateError) {
    console.error('Failed to update deal stage:', updateError);
    throw new Error('Could not update deal stage');
  }

  // 4. Synchronously trigger the Event Kernel to maintain full traceability
  try {
    const kernel = initializeEventKernel(supabase);
    await kernel.publish({
      eventType: 'Sales.DealStageAdvanced',
      aggregateType: 'Deal',
      aggregateId: dealId,
      agencyId: session.organizationId, // Context/Agency ID
      performedByUserId: user?.id || "",
      payload: {
        aggregateId: dealId,
        agencyId: session.organizationId,
        oldState: { stage: oldDeal?.stage },
        newState: { stage: newStage },
        metadata: {
          action: 'drag_and_drop_pipeline',
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (eventError) {
    console.error('Event Kernel synchronization failed:', eventError);
    // Depending on strictness, we might throw here to rollback, 
    // but we'll log it as per standard async side-effecting.
  }

  // 5. Revalidate the CRM pipeline page path to clear cache
  revalidatePath('/crm/pipeline');

  return { success: true, newStage };
}

