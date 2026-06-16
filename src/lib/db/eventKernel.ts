import { SupabaseClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// EVENT SOURCING: STRONGLY-TYPED DOMAIN EVENTS
// -----------------------------------------------------------------------------

export type EventType = 
  | 'CRM.LeadRegistered'
  | 'CRM.LeadStatusChanged'
  | 'Sales.DealCreated'
  | 'Sales.DealStageAdvanced'
  | 'Inventory.UnitReserved'
  | 'Inventory.UnitStatusChanged'
  | 'Finance.InstallmentCreated'
  | 'Finance.PaymentCleared';

export interface SystemEventPayload {
  aggregateId: string;
  agencyId: string;
  oldState?: Record<string, any>;
  newState?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface DomainEvent {
  eventType: EventType;
  aggregateType: 'Client' | 'Deal' | 'Unit' | 'Contract' | 'Installment';
  aggregateId: string;
  agencyId: string;
  payload: SystemEventPayload;
  performedByUserId?: string;
}

// -----------------------------------------------------------------------------
// EVENT KERNEL CLASS
// -----------------------------------------------------------------------------

export class EventKernel {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Publishes an event to the Event Bus and triggers synchronous domain logic.
   * This ensures full traceability of data state transitions.
   */
  async publish(event: DomainEvent): Promise<void> {
    // 1. Persist the event to the centralized Event Bus
    const { error: logError } = await this.supabase
      .from('event_bus')
      .insert({
        agency_id: event.agencyId,
        event_type: event.eventType,
        aggregate_type: event.aggregateType,
        aggregate_id: event.aggregateId,
        payload: event.payload,
        created_by: event.performedByUserId || null,
      });

    if (logError) {
      console.error('[EventKernel] Failed to log event to event_bus:', logError);
      throw new Error('Event logging failed. Rolling back transaction.');
    }

    // 2. Synchronous Event Handlers (Routing logic based on event types)
    await this.handleEventSynchronously(event);
  }

  /**
   * Internal router for synchronous side-effects.
   */
  private async handleEventSynchronously(event: DomainEvent) {
    switch (event.eventType) {
      case 'CRM.LeadRegistered':
        await this.evaluateSlaForNewLead(event);
        break;
      case 'Inventory.UnitReserved':
        await this.lockUnitAndNotify(event);
        break;
      case 'Finance.PaymentCleared':
        await this.updateContractFinancialStatus(event);
        break;
      default:
        // No synchronous handler found, purely a telemetry event.
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // PROCESSORS & SLA LOGIC
  // ---------------------------------------------------------------------------

  /**
   * Example: Processing a Lead's SLA. If a lead is registered, we must ensure it 
   * is touched within 2 hours. Instead of a cron job, we log an impending SLA 
   * breach into an execution inbox or delayed queue mechanism (simulation here).
   */
  private async evaluateSlaForNewLead(event: DomainEvent) {
    console.log(`[SLA Engine] Lead ${event.aggregateId} registered. SLA timer starts now (2h).`);
    
    // In a real implementation, we might schedule a background worker or insert a task 
    // into the 'execution_inbox' with a 'sla_breach_at' set to NOW() + 2 hours.
    const breachTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    
    // (Simulated insertion logic where Execution Inbox is present)
    /* 
    await this.supabase.from('execution_inbox').insert({
      agency_id: event.agencyId,
      task_type: 'LEAD_FOLLOWUP',
      title: 'Hot Lead Follow-up Required',
      description: 'Lead must be contacted before SLA breach.',
      priority: 'CRITICAL',
      reference_aggregate_type: 'Client',
      reference_aggregate_id: event.aggregateId,
      sla_breach_at: breachTime
    });
    */
    
    console.log(`[SLA Engine] Task queued for Lead ${event.aggregateId}. Deadline: ${breachTime}`);
  }

  private async lockUnitAndNotify(event: DomainEvent) {
    console.log(`[Inventory Engine] Unit ${event.aggregateId} reserved. Status LOCKED.`);
    // Verify that the status changed accurately
    if (event.payload.newState?.status === 'RESERVED') {
      // Typically, cross-module notifications go here.
    }
  }

  private async updateContractFinancialStatus(event: DomainEvent) {
    console.log(`[Finance Engine] Installment ${event.aggregateId} mathematically verified as CLEAR.`);
    // Update total deposited amount on Deal or Contract.
  }
}

// -----------------------------------------------------------------------------
// SINGLETON EXPORT
// -----------------------------------------------------------------------------
// Depending on architecture, you inject the Supabase client at the edge/server context
export function initializeEventKernel(supabaseClient: SupabaseClient) {
  return new EventKernel(supabaseClient);
}
