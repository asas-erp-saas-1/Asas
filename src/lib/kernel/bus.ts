import { SystemEvent, kernel } from './core';
import { eventRouter } from './router';

/**
 * PRODUCTION EVENT BUS
 * Persists events to the system_events table and routes them.
 */
export class PersistentEventBus {
    async publish(event: SystemEvent): Promise<void> {
        console.log(`[EVENT BUS] Emitting event: ${event.eventType} on ${event.aggregateType}`);
        
        try {
            // 1. Durability: Persist to Event Store (system_events)
            await kernel.mutate('system_events', 'INSERT', {
                id: event.id,
                event_type: event.eventType,
                aggregate_type: event.aggregateType,
                aggregate_id: event.aggregateId,
                payload: event.payload,
                source_module: event.sourceModule,
                created_by: event.createdBy,
                created_at: event.createdAt.toISOString()
            });

            // 2. Routing: Pass to Event Router
            await eventRouter.route(event);

        } catch (error) {
            console.error(`[EVENT BUS] Failed to publish event ${event.eventType}:`, error);
            throw new Error(`Event persistence failed: ${error}`);
        }
    }
}

export const eventBus = new PersistentEventBus();
