import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/asas_erp';

// Disable prefetch as it is not supported for "Transaction" pool mode (e.g. Supabase / Neon)
export const client = postgres(connectionString, { prepare: false });

// Global db instance without tenant constraints (use sparingly)
export const db = drizzle(client, { schema });

import { sql } from 'drizzle-orm';

/**
 * Returns a virtual Drizzle ORM instance with Row-Level Security (RLS) enabled
 * by intercepting all query executions using a Proxy and injecting the local `app.tenant_id` session setting.
 */
export function getTenantDb(tenantId: string): typeof db {
  const wrapBuilder = (builder: any): any => {
    return new Proxy(builder, {
      get(bTarget, bProp, bReceiver) {
        if (bProp === 'then') {
          return (onfulfilled?: any, onrejected?: any) => {
            // Execute the query inside a transaction to guarantee app.tenant_id is set for this session/connection
            const promise = db.transaction(async (tx) => {
              await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
              
              const savedSession = bTarget.session;
              try {
                bTarget.session = (tx as any).session;
                return await bTarget;
              } finally {
                bTarget.session = savedSession;
              }
            });
            return promise.then(onfulfilled, onrejected);
          };
        }
        
        const bValue = Reflect.get(bTarget, bProp, bReceiver);
        if (typeof bValue === 'function') {
          return (...bArgs: any[]) => {
            const nextBuilder = bValue.apply(bTarget, bArgs);
            return wrapBuilder(nextBuilder);
          };
        }
        return bValue;
      }
    });
  };

  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === 'transaction') {
        return async <T>(callback: (tx: any) => Promise<T>) => {
          return db.transaction(async (tx) => {
            await tx.execute(sql`select set_config('app.tenant_id', ${tenantId}, true)`);
            return callback(tx);
          });
        };
      }
      
      const value = Reflect.get(target, prop, receiver);
      
      // Intercept main query builders
      if (typeof value === 'function' && ['select', 'insert', 'update', 'delete'].includes(prop as string)) {
        return (...args: any[]) => {
          const originalBuilder = value.apply(target, args);
          return wrapBuilder(originalBuilder);
        };
      }
      
      // Intercept relational query namespace
      if (prop === 'query') {
        return new Proxy(value, {
          get(qTarget, qProp) {
            const tableQuery = Reflect.get(qTarget, qProp);
            if (!tableQuery) return tableQuery;
            return new Proxy(tableQuery, {
              get(tTarget, tProp) {
                const queryFunc = Reflect.get(tTarget, tProp);
                if (typeof queryFunc === 'function' && ['findMany', 'findFirst'].includes(tProp as string)) {
                  return (...args: any[]) => {
                    const originalBuilder = queryFunc.apply(tTarget, args);
                    return wrapBuilder(originalBuilder);
                  };
                }
                return queryFunc;
              }
            });
          }
        });
      }
      
      return value;
    }
  });
}
