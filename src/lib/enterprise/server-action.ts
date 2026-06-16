import { requireSession, SessionContext } from "./auth";
import { requirePermission, Resource, Action } from "./rbac";
import { ErrorTracker } from "@/lib/observability/errors";

export async function createEnterpriseAction<T, R>(
  resource: Resource,
  action: Action,
  executor: (data: T, session: SessionContext) => Promise<R>
): Promise<(data: T) => Promise<{ success: true; data: R } | { success: false; error: string }>> {
  return async (data: T) => {
    try {
      const session = await requireSession();
      requirePermission(session, resource, action);
      
      const result = await executor(data, session);
      return { success: true, data: result };
    } catch (error: any) {
      ErrorTracker.captureError(error, { context: `EnterpriseAction[${resource}:${action}]` });
      return { success: false, error: error.message || 'An error occurred during action execution.' };
    }
  };
}
