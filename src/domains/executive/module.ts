import { DomainRegistry } from '@/lib/kernel/registry';
import { CEODashboardProjection } from './projections';
import { FinanceEvents } from '../finance/events';
import { CRMEvents } from '../crm/events';

console.log("[DOMAIN BOOTSTRAP] Registering Executive Domain");

const ceoProjection = new CEODashboardProjection();

DomainRegistry.registerEventHandler(CRMEvents.DEAL_WON, ceoProjection);
DomainRegistry.registerEventHandler(FinanceEvents.PAYMENT_RECEIVED, ceoProjection);
