import { Command, CommandHandler } from './core';
import { DomainRegistry } from './registry';
import { eventBus } from './bus';
import { AggregateRoot } from './core';

/**
 * PRODUCTION COMMAND DISPATCHER
 * Routes commands to the appropriate handler and processes resulting events.
 */
export class CommandDispatcher {
  
  async dispatch<TCommand extends Command, TResult = any>(command: TCommand): Promise<TResult> {
    console.log(`[COMMAND DISPATCHER] Dispatching command: ${command.type}`);
    
    const handler = DomainRegistry.getCommandHandler(command.type);
    if (!handler) {
      throw new Error(`No command handler registered for command type: ${command.type}`);
    }

    // Wrap execution in standard try/catch logic
    try {
      const result = await handler.execute(command);
      
      // If the result is an Aggregate Root, we extract uncommitted events and publish them
      if (result && typeof (result as any).getUncommittedEvents === 'function') {
         const aggregate = result as AggregateRoot<any>;
         const events = aggregate.getUncommittedEvents();
         
         for (const event of events) {
            await eventBus.publish(event);
         }
         
         aggregate.markChangesAsCommitted();
      }

      return result;
    } catch (error) {
      console.error(`[COMMAND DISPATCHER] Error executing command ${command.type}:`, error);
      throw error;
    }
  }

}

export const commandDispatcher = new CommandDispatcher();
