import { stateMachineEngine } from '@/lib/kernel/state-machine';
import { CRMEvents } from '../crm/events';

// Deal Lifecycle for VSP (Vente sur Plan) Model in Algeria
stateMachineEngine.registerMachine('Deal', [
    {
        from: 'PROPOSAL',
        to: 'NEGOTIATION',
        event: 'CRM.DealNegotiationStarted'
    },
    {
        from: ['PROPOSAL', 'NEGOTIATION'],
        to: 'CONTRACT_PREPARATION',
        event: CRMEvents.DEAL_VSP_CONTRACT_GENERATED
    },
    {
        from: 'CONTRACT_PREPARATION',
        to: 'NOTARY_REVIEW',
        event: 'Legal.ContractSentToNotary'
    },
    {
        from: 'NOTARY_REVIEW',
        to: 'NOTARY_APPROVED',
        event: 'Legal.ContractApprovedByNotary'
    },
    {
        from: 'NOTARY_APPROVED',
        to: 'CLOSED_WON',
        event: CRMEvents.DEAL_WON
    },
    {
        from: ['PROPOSAL', 'NEGOTIATION', 'CONTRACT_PREPARATION', 'NOTARY_REVIEW'],
        to: 'CLOSED_LOST',
        event: CRMEvents.DEAL_LOST
    }
]);

console.log("[KERNEL] Deal VSP State Machine Registered");
