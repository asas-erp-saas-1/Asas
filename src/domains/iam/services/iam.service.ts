import { db } from '@/db';
import { users, roles, userRoles, rolePermissions, organizations } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';
import { ErrorTracker } from '@/lib/observability/errors';

export class IAMService {
  /**
   * Users Management
   */
  static async createUser(organizationId: string, email: string, firstName: string, lastName: string, provider: string = 'local', createdBy: string) {
    return await db.transaction(async (tx) => {
       const [newUser] = await tx.insert(users).values({
         organizationId,
         email,
         firstName,
         lastName,
         provider,
         status: 'active'
       }).returning();

       await logAudit({
         organizationId,
         userId: createdBy,
         action: 'CREATE_USER',
         entityType: 'users',
         entityId: newUser?.id || '',
         newData: { email, firstName, lastName }
       });

       return newUser;
    });
  }

  static async listUsers(organizationId: string) {
    return await db.select()
      .from(users)
      .where(and(eq(users.organizationId, organizationId), eq(users.status, 'active')));
  }

  static async deactivateUser(organizationId: string, userId: string, disabledBy: string) {
    return await db.transaction(async (tx) => {
       const [updated] = await tx.update(users)
         .set({ status: 'inactive', updatedAt: new Date() })
         .where(and(eq(users.id, userId), eq(users.organizationId, organizationId)))
         .returning();

       await logAudit({
         organizationId,
         userId: disabledBy,
         action: 'DEACTIVATE_USER',
         entityType: 'users',
         entityId: userId,
         newData: { status: 'inactive' }
       });

       return updated;
    });
  }

  /**
   * Roles & Permissions
   */
  static async createRole(organizationId: string, name: string, description: string, permissions: Array<{ context: string, action: string }>, createdBy: string) {
    return await db.transaction(async (tx) => {
       const [newRole] = await tx.insert(roles).values({
         organizationId,
         name,
         description,
         isSystem: false
       }).returning();

       if (permissions.length > 0) {
         const permsToInsert = permissions.map(p => ({
           roleId: newRole!.id,
           permissionContext: p.context,
           action: p.action
         }));
         await tx.insert(rolePermissions).values(permsToInsert);
       }

       await logAudit({
         organizationId,
         userId: createdBy,
         action: 'CREATE_ROLE',
         entityType: 'roles',
         entityId: newRole?.id || '',
         newData: { name, permissions }
       });

       return newRole;
    });
  }

  static async listRoles(organizationId: string) {
    const allRoles = await db.select().from(roles).where(eq(roles.organizationId, organizationId));
    const allPerms = await db.select().from(rolePermissions);

    return allRoles.map(r => ({
      ...r,
      permissions: allPerms.filter(p => p.roleId === r.id)
    }));
  }

  static async assignRole(organizationId: string, userId: string, roleId: string, assignedBy: string) {
    return await db.transaction(async (tx) => {
       const assigned = await tx.insert(userRoles).values({
         userId,
         roleId
       }).onConflictDoNothing();

       await logAudit({
         organizationId,
         userId: assignedBy,
         action: 'ASSIGN_ROLE',
         entityType: 'user_roles',
         entityId: userId,
         newData: { roleId }
       });

       return assigned;
    });
  }
}
