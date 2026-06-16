import { CommandHandler, EventHandler, SystemEvent, kernel } from '@/lib/kernel/core';
import { AdvanceMilestoneCommand } from './commands';
import { ConstructionEvents } from './events';
import { eventBus } from '@/lib/kernel/bus';

export class AdvanceMilestoneCommandHandler implements CommandHandler<AdvanceMilestoneCommand> {
    async execute(command: AdvanceMilestoneCommand): Promise<void> {
        // TODO: Update read model for project milestone
        await eventBus.publish({
            id: crypto.randomUUID(),
            eventType: ConstructionEvents.MILESTONE_ADVANCED,
            aggregateType: 'Project',
            aggregateId: command.payload.projectId,
            sourceModule: 'Construction',
            payload: command.payload,
            createdAt: new Date(),
            createdBy: command.userId
        });
    }
}

export class MilestoneAdvancedEventHandler implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[CONSTRUCTION] Handling milestone advancement for project ${event.aggregateId}`);
        // TODO: Trigger billing if milestone hits 100%
    }
}
