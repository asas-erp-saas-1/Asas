import { CommandHandler, EventHandler, SystemEvent, kernel } from '@/lib/kernel/core';
import { RegisterLeadCommand, InitiateDealCommand } from './commands';
import { CRMEvents, LeadRegisteredPayload, DealInitiatedPayload } from './events';
import { eventBus } from '@/lib/kernel/bus';

export class RegisterLeadCommandHandler implements CommandHandler<RegisterLeadCommand> {
  async execute(command: RegisterLeadCommand): Promise<string> {
    const leadId = crypto.randomUUID();
    
    // Save to read model / state
    await kernel.mutate('leads', 'INSERT', {
        id: leadId,
        agency_id: command.payload.agencyId,
        first_name: command.payload.firstName,
        last_name: command.payload.lastName,
        phone_number: command.payload.phone,
        lead_source: command.payload.source,
        status: 'NEW'
    });

    // Fire Event
    await eventBus.publish({
        id: crypto.randomUUID(),
        eventType: CRMEvents.LEAD_REGISTERED,
        aggregateType: 'Lead',
        aggregateId: leadId,
        sourceModule: 'CRM',
        payload: {
            agencyId: command.payload.agencyId,
            leadId: leadId,
            firstName: command.payload.firstName,
            lastName: command.payload.lastName,
            phone: command.payload.phone,
            source: command.payload.source
        },
        createdAt: new Date(),
        createdBy: command.userId
    });

    return leadId;
  }
}

export class InitiateDealCommandHandler implements CommandHandler<InitiateDealCommand> {
  async execute(command: InitiateDealCommand): Promise<string> {
    const dealId = crypto.randomUUID();

    await kernel.mutate('deals', 'INSERT', {
        id: dealId,
        agency_id: command.payload.agencyId,
        lead_id: command.payload.leadId,
        property_id: command.payload.propertyId,
        value: command.payload.initialValue,
        stage: 'PROPOSAL'
    });

    await eventBus.publish({
        id: crypto.randomUUID(),
        eventType: CRMEvents.DEAL_INITIATED,
        aggregateType: 'Deal',
        aggregateId: dealId,
        sourceModule: 'CRM',
        payload: {
            agencyId: command.payload.agencyId,
            dealId: dealId,
            leadId: command.payload.leadId,
            propertyId: command.payload.propertyId,
            initialValue: command.payload.initialValue
        },
        createdAt: new Date(),
        createdBy: command.userId
    });

    return dealId;
  }
}

// Event Handlers for read model generation or inbox routing
export class LeadRegisteredEventHandler implements EventHandler<LeadRegisteredPayload> {
  async handle(event: SystemEvent<LeadRegisteredPayload>): Promise<void> {
      console.log(`[CRM READ MODEL UPDATER] Tracking new lead ${event.payload.leadId}`);
      // Send task to assign lead
      const { inboxEngine } = await import('@/lib/kernel/inbox');
      await inboxEngine.generateTask({
          agency_id: event.payload.agencyId,
          task_type: 'ASSIGN_LEAD',
          title: `Assign new lead: ${event.payload.firstName} ${event.payload.lastName}`,
          priority: 'HIGH',
          status: 'PENDING',
          role_target: 'SALES_MANAGER',
          domain: 'CRM',
          reference_aggregate_type: 'Lead',
          reference_aggregate_id: event.payload.leadId,
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h SLA
      });
  }
}
