import { DomainRegistry } from '@/lib/kernel/registry';
import { AdvanceMilestoneCommandHandler, MilestoneAdvancedEventHandler } from './handlers';
import { ConstructionEvents } from './events';

console.log("[DOMAIN BOOTSTRAP] Registering Construction Domain");

DomainRegistry.registerCommandHandler('Construction.AdvanceMilestone', new AdvanceMilestoneCommandHandler());
DomainRegistry.registerEventHandler(ConstructionEvents.MILESTONE_ADVANCED, new MilestoneAdvancedEventHandler());
