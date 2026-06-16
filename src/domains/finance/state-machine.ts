import { stateMachineEngine } from '@/lib/kernel/state-machine';
import { FinanceEvents } from './events';

stateMachineEngine.registerMachine('PaymentSchedule', [
    {
        from: 'DRAFT',
        to: 'ACTIVE',
        event: FinanceEvents.PAYMENT_SCHEDULE_CREATED
    },
    {
        from: 'ACTIVE',
        to: 'COMPLETED',
        event: 'Finance.AllInstallmentsPaid'
    },
    {
        from: 'ACTIVE',
        to: 'DEFAULTED',
        event: 'Finance.PaymentScheduleDefaulted'
    }
]);

console.log("[KERNEL] Payment Schedule State Machine Registered");
