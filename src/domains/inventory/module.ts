import { DomainRegistry } from '@/lib/kernel/registry';
import { CommandHandler, Command, SystemEvent, EventHandler } from '@/lib/kernel/core';
import { eventBus } from '@/lib/kernel/bus';

export const InventoryEvents = { STOCK_UPDATED: 'Inventory.StockUpdated' };

export interface UpdateStockCommand extends Command<{ agencyId: string, materialId: string, quantityDelta: number }> { type: 'Inventory.UpdateStock'; }

class UpdateStockCommandHandler implements CommandHandler<UpdateStockCommand> {
    async execute(c: UpdateStockCommand): Promise<void> {
        await eventBus.publish({
            id: crypto.randomUUID(), eventType: InventoryEvents.STOCK_UPDATED, aggregateType: 'Material', aggregateId: c.payload.materialId,
            sourceModule: 'Inventory', payload: c.payload, createdAt: new Date(), createdBy: c.userId
        });
    }
}

class StockUpdatedEventHandler implements EventHandler<any> {
    async handle(event: SystemEvent<any>): Promise<void> {
        console.log(`[INVENTORY] Stock updated, checking reorder levels...`);
    }
}

console.log("[DOMAIN BOOTSTRAP] Registering Inventory Domain");

DomainRegistry.registerCommandHandler('Inventory.UpdateStock', new UpdateStockCommandHandler());
DomainRegistry.registerEventHandler(InventoryEvents.STOCK_UPDATED, new StockUpdatedEventHandler());
