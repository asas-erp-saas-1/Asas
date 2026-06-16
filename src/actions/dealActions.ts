'use server';

import { DealService } from '@/services/deals/deal.service';
import { ErrorTracker } from '@/lib/observability/errors';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export async function createDealAction(data: any) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write');

    const mappedData = { ...data, organization_id: session.organizationId, created_by: session.userId };
    const deal = await DealService.createDeal(mappedData);
    revalidatePath('/dashboard/deals');
    return { success: true, data: deal };
  } catch (error: any) {
    ErrorTracker.captureError(error, { context: 'createDealAction' });
    return { success: false, error: error.message };
  }
}

export async function updateDealStageAction(id: string, stage: string, currentVersion: number = 1, metadata?: { lostReason?: string }) {
  try {
    const session = await requireSession();
    // In a real scenario, deals:write or deals:admin would authorize this
    requirePermission(session, 'deals', 'write');

    const deal = await DealService.changeDealStatus(id, stage, currentVersion, metadata);
    revalidatePath('/dashboard/deals');
    return { success: true, data: deal };
  } catch (error: any) {
    ErrorTracker.captureError(error, { context: 'updateDealStageAction' });
    return { success: false, error: error.message };
  }
}


