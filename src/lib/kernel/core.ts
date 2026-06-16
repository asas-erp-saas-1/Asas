// src/lib/kernel/core.ts

/**
 * ASAS KERNEL - SYSTEM CORE
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const createSupabaseClient = async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
    const cookieStore = await cookies();
    
    return createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() { return cookieStore.getAll(); },
            setAll(cookiesToSet) {
              try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
            }
        }
    });
};

export interface SystemEvent<T = any> {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: T;
  sourceModule: string;
  createdBy?: string;
  createdAt: Date;
}

export interface EventHandler<T = any> {
  handle(event: SystemEvent<T>): Promise<void>;
}

export interface Command<T = any> {
  type: string;
  payload: T;
  userId: string;
}

export interface CommandHandler<TCommand extends Command, TResult = any> {
  execute(command: TCommand): Promise<TResult>;
}

// Event bus removed, using persistent message queue via PersistentEventBus

export const SystemEvents = {
  LEAD_CREATED: 'LeadCreated',
  DEAL_INITIATED: 'DealInitiated',
  DEAL_DISCOUNT_REQUESTED: 'DealDiscountRequested',
  DEAL_APPROVED: 'DealApproved',
  PAYMENT_RECEIVED: 'PaymentReceived',
  MILESTONE_COMPLETED: 'MilestoneCompleted',
  APPROVAL_GRANTED: 'ApprovalGranted',
  APPROVAL_REQUESTED: 'ApprovalRequested',
  APPROVAL_REJECTED: 'ApprovalRejected',
};

export abstract class AggregateRoot<T> {
  public readonly id: string;
  protected state: T;
  private uncommittedEvents: SystemEvent[] = [];

  constructor(id: string, initialState: T) {
    this.id = id;
    this.state = initialState;
  }

  protected applyChange(event: SystemEvent, isNew: boolean = true) {
    this.mutate(event);
    if (isNew) {
      this.uncommittedEvents.push(event);
    }
  }

  public getUncommittedEvents() {
    return this.uncommittedEvents;
  }

  public markChangesAsCommitted() {
    this.uncommittedEvents = [];
  }

  protected abstract mutate(event: SystemEvent): void;
}

// ----- LEGACY KERNEL API RE-IMPLEMENTATION -----

export interface KernelIdentity {
  userId: string;
  tenantId: string;
  role: string;
}

export interface IKernel {
  identity(): Promise<KernelIdentity>;
  query<T>(table: string, options?: any): Promise<T[]>;
  mutate<T>(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload?: any, filters?: any): Promise<T | null>;
  transaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}

export class KernelAPI implements IKernel {
  async identity() {
    try {
      // Defer to the single source of truth for auth
      const { getSession } = await import('@/lib/enterprise/auth');
      const session = await getSession();
      if (!session) {
         return { userId: 'unknown', tenantId: 'unknown', role: 'unknown' };
      }
      return { 
        userId: session.userId || 'unknown', 
        tenantId: session.organizationId || 'unknown',
        role: session.role || 'unknown'
      };
    } catch (err: any) {
      if (err.message && err.message.includes('Tenant isolation failure')) {
         throw err;
      }
      return { userId: 'unknown', tenantId: 'unknown', role: 'unknown' };
    }
  }

  async query<T>(table: string, options: any = {}): Promise<T[]> {
    const supabase = await createSupabaseClient();
    let query = supabase.from(table).select(options.select || '*');
    
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (Array.isArray(value)) {
            query = query.in(key, value);
        } else {
            query = query.eq(key, value);
        }
      }
    }
    
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) {
       console.error(`Kernel Query Error [${table}]:`, error);
       return [];
    }
    return (data || []) as T[];
  }

  async mutate<T>(table: string, action: 'INSERT' | 'UPDATE' | 'DELETE', payload?: any, filters?: any): Promise<T | null> {
    const supabase = await createSupabaseClient();
    let query;
    
    if (action === 'INSERT') {
      const { data, error } = await supabase.from(table).insert(payload).select().single();
      if (error) console.error(`Kernel Mutate Error [${table} INSERT]:`, error);
      return data as T;
    } 
    
    query = action === 'UPDATE' ? supabase.from(table).update(payload) : supabase.from(table).delete();
    
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
         query = query.eq(key, value);
      }
    }
    
    const { data, error } = await query.select();
    if (error) console.error(`Kernel Mutate Error [${table} ${action}]:`, error);
    return data && data.length > 0 ? data[0] as T : null;
  }

  async transaction<T>(callback: (tx: KernelAPI) => Promise<T>): Promise<T> {
    // Basic wrapper
    return await callback(this);
  }
}

export const kernel = new KernelAPI();
