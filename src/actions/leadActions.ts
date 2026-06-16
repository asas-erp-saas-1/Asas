'use server';

import { LeadService } from '@/services/leads/lead.service';
import { ErrorTracker } from '@/lib/observability/errors';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export async function updateLeadStatusAction(
  id: string, 
  newStatus: string,
  metadata?: { lostReason?: string }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'leads', 'write');

    const lead = await LeadService.updateStatus(id, newStatus, metadata);
    revalidatePath('/dashboard/leads');
    return { success: true, data: lead };
  } catch (error: any) {
    ErrorTracker.captureError(error, { context: 'updateLeadStatusAction' });
    return { success: false, error: error.message };
  }
}

