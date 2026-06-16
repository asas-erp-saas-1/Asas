import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { ErrorTracker } from "@/lib/observability/errors";

interface AuditLogPayload {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
}

/**
 * Record an audit log securely outside of the main transaction flow to avoid failing the core request.
 */
export async function logAudit(payload: AuditLogPayload) {
  try {
    // We launch this as an async operation to prevent it from blocking API response times 
    // unless strict sequential transactional logging is required by compliance.
    await db.insert(auditLogs).values({
      organizationId: payload.organizationId,
      actorId: payload.userId,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      oldPayload: payload.oldData ? JSON.parse(JSON.stringify(payload.oldData)) : null,
      newPayload: payload.newData ? JSON.parse(JSON.stringify(payload.newData)) : null,
      ipAddress: payload.ipAddress,
    });
  } catch (error: any) {
    // We do NOT throw here typically, as audit logging failure shouldn't crash the business transaction,
    // but we heavily monitor it.
    ErrorTracker.captureError(error, { 
       context: 'Failed to write audit log', 
       tags: { action: payload.action, entity: payload.entityType } 
    });
  }
}
