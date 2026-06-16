import { EventHandler, SystemEvent, kernel } from '@/lib/kernel/core';
import { DomainRegistry } from '@/lib/kernel/registry';
import { CRMEvents } from '../crm/events';

export class SalesPerformanceProjection implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[PROJECTION] Updating Sales Performance for Event: ${event.eventType}`);
        
        if (event.eventType === CRMEvents.DEAL_WON) {
            // Update materialized view / analytics table
            // In a real CQRS, you'd insert/update a projection table
            await kernel.mutate('activities', 'INSERT', {
                agency_id: event.payload.agencyId,
                channel: 'system',
                direction: 'inbound',
                content: `Deal ${event.aggregateId} won! Revenue recognized.`,
            });
        }
    }
}

console.log("[DOMAIN BOOTSTRAP] Registering Projections...");
DomainRegistry.registerEventHandler(CRMEvents.DEAL_WON, new SalesPerformanceProjection());
