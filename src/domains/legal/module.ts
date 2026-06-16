import { DomainRegistry } from '@/lib/kernel/registry';
import { CommandHandler, Command, SystemEvent, EventHandler } from '@/lib/kernel/core';
import { eventBus } from '@/lib/kernel/bus';

export const LegalEvents = { CONTRACT_GENERATED: 'Legal.ContractGenerated' };

export interface GenerateContractCommand extends Command<{ agencyId: string, dealId: string }> { type: 'Legal.GenerateContract'; }

class GenerateContractCommandHandler implements CommandHandler<GenerateContractCommand> {
    async execute(c: GenerateContractCommand): Promise<void> {
        await eventBus.publish({
            id: crypto.randomUUID(), eventType: LegalEvents.CONTRACT_GENERATED, aggregateType: 'Contract', aggregateId: c.payload.dealId,
            sourceModule: 'Legal', payload: c.payload, createdAt: new Date(), createdBy: c.userId
        });
    }
}

class ContractGeneratedEventHandler implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[LEGAL] Review tasks generated for Contract on Deal ${event.aggregateId}`);
        // TODO: route to InboxEngine for Notary scheduling
    }
}

DomainRegistry.registerCommandHandler('Legal.GenerateContract', new GenerateContractCommandHandler());
DomainRegistry.registerEventHandler(LegalEvents.CONTRACT_GENERATED, new ContractGeneratedEventHandler());
