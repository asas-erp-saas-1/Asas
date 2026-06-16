import { DomainRegistry } from '@/lib/kernel/registry';
import { CommandHandler, Command, SystemEvent, EventHandler } from '@/lib/kernel/core';
import { eventBus } from '@/lib/kernel/bus';

export const HREvents = { EMPLOYEE_ONBOARDED: 'HR.EmployeeOnboarded' };

export interface OnboardEmployeeCommand extends Command<{ agencyId: string, firstName: string, lastName: string, role: string }> { type: 'HR.OnboardEmployee'; }

class OnboardEmployeeCommandHandler implements CommandHandler<OnboardEmployeeCommand> {
    async execute(c: OnboardEmployeeCommand): Promise<void> {
        await eventBus.publish({
            id: crypto.randomUUID(), eventType: HREvents.EMPLOYEE_ONBOARDED, aggregateType: 'Employee', aggregateId: crypto.randomUUID(),
            sourceModule: 'HR', payload: c.payload, createdAt: new Date(), createdBy: c.userId
        });
    }
}

class EmployeeOnboardedEventHandler implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[HR] Employee Onboarded, provisioning access...`);
        // TODO: Map to Inbox -> generate IT task
    }
}

console.log("[DOMAIN BOOTSTRAP] Registering HR Domain");

DomainRegistry.registerCommandHandler('HR.OnboardEmployee', new OnboardEmployeeCommandHandler());
DomainRegistry.registerEventHandler(HREvents.EMPLOYEE_ONBOARDED, new EmployeeOnboardedEventHandler());
