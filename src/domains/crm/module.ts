import { DomainRegistry } from '@/lib/kernel/registry';
import { RegisterLeadCommandHandler, InitiateDealCommandHandler, LeadRegisteredEventHandler } from './handlers';
import { CRMEvents } from './events';
import './state-machine';
import './projections';

console.log("[DOMAIN BOOTSTRAP] Registering CRM Domain");

DomainRegistry.registerCommandHandler('CRM.RegisterLead', new RegisterLeadCommandHandler());
DomainRegistry.registerCommandHandler('CRM.InitiateDeal', new InitiateDealCommandHandler());

DomainRegistry.registerEventHandler(CRMEvents.LEAD_REGISTERED, new LeadRegisteredEventHandler());
