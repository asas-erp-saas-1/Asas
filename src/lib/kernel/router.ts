import { SystemEvent, EventHandler } from './core';
import { DomainRegistry } from './registry';

/**
 * PRODUCTION EVENT ROUTER
 * Routes system events to registered domain handlers.
 */
export class EventRouter {
  
  async route(event: SystemEvent): Promise<void> {
     console.log(`[EVENT ROUTER] Routing event: ${event.eventType} for Aggregate: ${event.aggregateType}[${event.aggregateId}]`);
     
     const handlers = DomainRegistry.getEventHandlers(event.eventType);
     
     if (!handlers || handlers.length === 0) {
        console.warn(`[EVENT ROUTER] No handlers registered for event type: ${event.eventType}`);
        return;
     }

     for (const handler of handlers) {
        try {
           console.log(`[EVENT ROUTER] Executing handler for: ${event.eventType}`);
           await handler.handle(event);
        } catch (error) {
           console.error(`[EVENT ROUTER] Handler failed for event ${event.eventType}:`, error);
           // In a resilient system, we would push this to a Dead Letter Queue / Error Inbox
        }
     }
  }

}

export const eventRouter = new EventRouter();
