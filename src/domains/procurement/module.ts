import { DomainRegistry } from '@/lib/kernel/registry';
import { CommandHandler, Command, SystemEvent, EventHandler } from '@/lib/kernel/core';
import { eventBus } from '@/lib/kernel/bus';

export const ProcurementEvents = { PO_REQUESTED: 'Procurement.PORequested' };

export interface RequestPOCommand extends Command<{ agencyId: string, projectId: string, amount: number, materials: any[] }> { type: 'Procurement.RequestPO'; }

class RequestPOCommandHandler implements CommandHandler<RequestPOCommand> {
    async execute(c: RequestPOCommand): Promise<void> {
        await eventBus.publish({
            id: crypto.randomUUID(), eventType: ProcurementEvents.PO_REQUESTED, aggregateType: 'PurchaseOrder', aggregateId: crypto.randomUUID(),
            sourceModule: 'Procurement', payload: c.payload, createdAt: new Date(), createdBy: c.userId
        });
    }
}

class PORequestedEventHandler implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[PROCUREMENT] PO requested, evaluating approval workflow.`);
        // TODO: Map to Approval Engine -> generate ApprovalChain
    }
}

DomainRegistry.registerCommandHandler('Procurement.RequestPO', new RequestPOCommandHandler());
DomainRegistry.registerEventHandler(ProcurementEvents.PO_REQUESTED, new PORequestedEventHandler());
