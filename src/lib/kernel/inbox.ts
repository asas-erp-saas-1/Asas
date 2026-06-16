import { kernel } from './core';

export interface InboxTask {
  id?: string;
  agency_id: string;
  branch_id?: string;
  task_type: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ESCALATED';
  assignee_id?: string;
  role_target?: string;
  domain: string;
  reference_aggregate_type: string;
  reference_aggregate_id: string;
  due_date?: Date;
  sla_breach_at?: Date;
  payload?: any;
}

export class InboxEngine {
  async generateTask(task: InboxTask): Promise<void> {
    console.log(`[INBOX GENERATOR] Creating task: ${task.title} for Role: ${task.role_target} / Assignee: ${task.assignee_id}`);
    
    // Ensure critical fields are set
    const dataToInsert = {
        ...task,
        due_date: task.due_date?.toISOString(),
        sla_breach_at: task.sla_breach_at?.toISOString()
    };

    await kernel.mutate('execution_inbox', 'INSERT', dataToInsert);
  }

  async resolveTask(taskId: string, actorId: string, resolutionNotes?: string): Promise<void> {
     // Implement status change
     await kernel.mutate('execution_inbox', 'UPDATE', {
         status: 'COMPLETED',
         resolved_by: actorId,
         resolved_at: new Date().toISOString(),
         resolution_notes: resolutionNotes
     }, { id: taskId });
  }

  async escalateBreachedTasks(): Promise<void> {
     console.log(`[INBOX ENGINE] Evaluating SLAs...`);
     // Complex query handled by edge function or pg_cron directly on supabase,
     // but kernel query can fetch breached:
     const breached = await kernel.query<any>('execution_inbox', {
         filters: {
             status: 'PENDING'
         }
         // Note: further operator filtering like sla_breach_at < NOW() requires custom RPC or advanced filter
     });
     
     const now = new Date();
     for (const task of breached) {
         if (task.sla_breach_at && new Date(task.sla_breach_at) < now) {
             console.log(`[INBOX ENGINE] Escalating Task: ${task.id}`);
             await kernel.mutate('execution_inbox', 'UPDATE', {
                 status: 'ESCALATED',
                 escalation_count: (task.escalation_count || 0) + 1
             }, { id: task.id });
             // Could trigger a new system event for escalation -> trigger webhook/SMS
         }
     }
  }
}

export const inboxEngine = new InboxEngine();
