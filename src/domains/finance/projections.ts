import { EventHandler, SystemEvent, kernel } from '@/lib/kernel/core';
import { DomainRegistry } from '@/lib/kernel/registry';
import { FinanceEvents } from '../finance/events';

export class FinanceDashboardProjection implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[PROJECTION] Updating Finance Dashboard for ${event.eventType}`);
    }
}

DomainRegistry.registerEventHandler(FinanceEvents.PAYMENT_RECEIVED, new FinanceDashboardProjection());
