import { EventHandler, CommandHandler, Command } from './core';

/**
 * DOMAIN REGISTRY SYSTEM
 * Maintains the registry of all event and command handlers across domains.
 */
export class Registry {
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private commandHandlers: Map<string, CommandHandler<any, any>> = new Map();

  registerEventHandler(eventType: string, handler: EventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
    console.log(`[REGISTRY] Registered Event Handler for: ${eventType}`);
  }

  registerCommandHandler(commandType: string, handler: CommandHandler<any, any>) {
    if (this.commandHandlers.has(commandType)) {
      throw new Error(`Command Handler for ${commandType} is already registered.`);
    }
    this.commandHandlers.set(commandType, handler);
    console.log(`[REGISTRY] Registered Command Handler for: ${commandType}`);
  }

  getEventHandlers(eventType: string): EventHandler[] {
    return this.eventHandlers.get(eventType) || [];
  }

  getCommandHandler(commandType: string): CommandHandler<any, any> | undefined {
    return this.commandHandlers.get(commandType);
  }
}

export const DomainRegistry = new Registry();
