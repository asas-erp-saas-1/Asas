import { ErrorTracker } from "@/lib/observability/errors";

export type Action = 'read' | 'write' | 'delete' | 'admin';
export type Resource = 'deals' | 'projects' | 'clients' | 'properties' | 'users' | 'settings' | 'roles' | 'attendance' | 'vendors' | 'workflows' | 'contracts' | 'invoices' | 'reservations' | 'chantiers' | 'opportunities' | 'leads' | 'organizations' | 'support' | 'system' | 'tasks' | 'crm' | 'departments' | 'documents' | 'finance' | 'hr';

export interface RBACContext {
  userId: string;
  role: string;
  permissions: string[]; // Formatted as "resource:action", e.g., "deals:read"
}

/**
 * Check if the given context has permission to perform standard actions.
 * In a real application, permissions might be evaluated more dynamically.
 */
export function hasPermission(context: RBACContext, resource: Resource, action: Action): boolean {
  try {
    if (context.role === 'admin' || context.role === 'super_admin') {
      return true; // Admins have global override
    }

    const requiredPermission = `${resource}:${action}`;
    const mappedWildcard = `${resource}:*`;

    return context.permissions.includes(requiredPermission) || context.permissions.includes(mappedWildcard) || context.permissions.includes('*:*');
  } catch (err: any) {
    ErrorTracker.captureError(err, { context: 'hasPermission check failed', tags: { resource, action } });
    return false;
  }
}

/**
 * Ensure permission or throw an error (for API routes)
 */
export function requirePermission(context: RBACContext, resource: Resource, action: Action) {
  if (!hasPermission(context, resource, action)) {
    throw new Error(`Forbidden: Missing ${resource}:${action} permission.`);
  }
}
