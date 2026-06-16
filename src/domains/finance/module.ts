import { DomainRegistry } from '@/lib/kernel/registry';
import { CreatePaymentScheduleCommandHandler, RequestDiscountCommandHandler, DiscountRequestedEventHandler } from './handlers';
import { FinanceEvents } from './events';
import './state-machine';
import './projections';

console.log("[DOMAIN BOOTSTRAP] Registering Finance Domain");

DomainRegistry.registerCommandHandler('Finance.CreatePaymentSchedule', new CreatePaymentScheduleCommandHandler());
DomainRegistry.registerCommandHandler('Finance.RequestDiscount', new RequestDiscountCommandHandler());

DomainRegistry.registerEventHandler(FinanceEvents.DISCOUNT_REQUESTED, new DiscountRequestedEventHandler());
