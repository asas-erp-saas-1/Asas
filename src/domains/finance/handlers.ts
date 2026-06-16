import { CommandHandler, EventHandler, SystemEvent, kernel } from '@/lib/kernel/core';
import { CreatePaymentScheduleCommand, RequestDiscountCommand } from './commands';
import { FinanceEvents, PaymentScheduleCreatedPayload } from './events';
import { eventBus } from '@/lib/kernel/bus';

export class CreatePaymentScheduleCommandHandler implements CommandHandler<CreatePaymentScheduleCommand> {
  async execute(command: CreatePaymentScheduleCommand): Promise<string> {
    const scheduleId = crypto.randomUUID();
    
    await kernel.mutate('payment_schedules', 'INSERT', {
        id: scheduleId,
        agency_id: command.payload.agencyId,
        deal_id: command.payload.dealId,
        total_amount: command.payload.totalAmount,
        installments_count: command.payload.installmentsCount,
        status: 'ACTIVE'
    });

    await eventBus.publish({
        id: crypto.randomUUID(),
        eventType: FinanceEvents.PAYMENT_SCHEDULE_CREATED,
        aggregateType: 'PaymentSchedule',
        aggregateId: scheduleId,
        sourceModule: 'Finance',
        payload: {
            agencyId: command.payload.agencyId,
            scheduleId: scheduleId,
            dealId: command.payload.dealId,
            totalAmount: command.payload.totalAmount,
            installmentsCount: command.payload.installmentsCount
        },
        createdAt: new Date(),
        createdBy: command.userId
    });

    return scheduleId;
  }
}

export class RequestDiscountCommandHandler implements CommandHandler<RequestDiscountCommand> {
  async execute(command: RequestDiscountCommand): Promise<string> {
    const requestId = crypto.randomUUID();
    
    await eventBus.publish({
        id: crypto.randomUUID(),
        eventType: FinanceEvents.DISCOUNT_REQUESTED,
        aggregateType: 'Deal',
        aggregateId: command.payload.dealId,
        sourceModule: 'Finance',
        payload: {
            agencyId: command.payload.agencyId,
            dealId: command.payload.dealId,
            originalAmount: command.payload.originalAmount,
            requestedDiscount: command.payload.requestedDiscount,
            justification: command.payload.justification
        },
        createdAt: new Date(),
        createdBy: command.userId
    });

    return requestId;
  }
}

export class DiscountRequestedEventHandler implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[FINANCE INBOX ROUTING] Routing discount request for Deal ${event.aggregateId}`);
        const { inboxEngine } = await import('@/lib/kernel/inbox');
        
        let roleTarget = 'FINANCE_MANAGER';
        if (event.payload.requestedDiscount > 1000000) { // arbitrary threshold for CEO
            roleTarget = 'CEO';
        }

        await inboxEngine.generateTask({
            agency_id: event.payload.agencyId,
            task_type: 'APPROVE_DISCOUNT',
            title: `Approve discount of ${event.payload.requestedDiscount} DZD for Deal ${event.aggregateId}`,
            priority: 'HIGH',
            status: 'PENDING',
            role_target: roleTarget,
            domain: 'Finance',
            reference_aggregate_type: 'Deal',
            reference_aggregate_id: event.aggregateId,
            payload: event.payload,
            sla_breach_at: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12h SLA 
        });
    }
}
