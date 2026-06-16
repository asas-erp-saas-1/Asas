import { kernel } from './core';
import { eventBus } from './bus';
import { SystemEvent } from './core';

export interface StateTransition {
    from: string | string[];
    to: string;
    event: string;
    guard?: (payload: any) => boolean | Promise<boolean>;
    action?: (payload: any) => void | Promise<void>;
}

export class StateMachineEngine {
    private transitions: Map<string, StateTransition[]> = new Map();

    registerMachine(aggregateType: string, transitions: StateTransition[]) {
        this.transitions.set(aggregateType, transitions);
        console.log(`[STATE MACHINE] Registered state machine for ${aggregateType}`);
    }

    async transition(aggregateType: string, aggregateId: string, eventName: string, payload: any): Promise<boolean> {
        console.log(`[STATE MACHINE] Attempting transition for ${aggregateType}[${aggregateId}] on ${eventName}`);
        
        const machine = this.transitions.get(aggregateType);
        if (!machine) {
            console.warn(`[STATE MACHINE] No state machine found for ${aggregateType}`);
            return false;
        }

        const transition = machine.find(t => t.event === eventName);
        if (!transition) {
            console.warn(`[STATE MACHINE] No transition found for event ${eventName} on ${aggregateType}`);
            return false;
        }

        if (transition.guard) {
            const allowed = await transition.guard(payload);
            if (!allowed) {
                console.warn(`[STATE MACHINE] Guard rejected transition ${eventName} on ${aggregateType}`);
                return false;
            }
        }

        if (transition.action) {
            await transition.action(payload);
        }

        console.log(`[STATE MACHINE] Transitioned ${aggregateType}[${aggregateId}] to state ${transition.to}`);
        return true;
    }
}

export const stateMachineEngine = new StateMachineEngine();
