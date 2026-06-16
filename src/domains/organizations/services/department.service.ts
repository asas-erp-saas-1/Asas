import { db } from '@/db';
import { departments, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class DepartmentService {
  static async createDepartment(organizationId: string, name: string, parentId: string | null, managerId: string | null, createdBy: string) {
    return await db.transaction(async (tx) => {
       const [newDept] = await tx.insert(departments).values({
         organizationId,
         name,
         parentId,
         managerId
       }).returning();

       await logAudit({
         organizationId,
         userId: createdBy,
         action: 'CREATE_DEPARTMENT',
         entityType: 'departments',
         entityId: newDept?.id || '',
         newData: { name, parentId, managerId }
       });

       return newDept;
    });
  }

  static async listDepartments(organizationId: string) {
    return await db.select({
      id: departments.id,
      name: departments.name,
      parentId: departments.parentId,
      managerId: departments.managerId,
      manager: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }
    })
    .from(departments)
    .leftJoin(users, eq(departments.managerId, users.id))
    .where(and(eq(departments.organizationId, organizationId), isNull(departments.deletedAt)));
  }

  static async updateDepartment(organizationId: string, departmentId: string, data: { name?: string; parentId?: string | null; managerId?: string | null }, updatedBy: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(departments)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(departments.id, departmentId), eq(departments.organizationId, organizationId)))
        .returning();

      await logAudit({
         organizationId,
         userId: updatedBy,
         action: 'UPDATE_DEPARTMENT',
         entityType: 'departments',
         entityId: departmentId,
         newData: data
      });

      return updated;
    });
  }

  static async deleteDepartment(organizationId: string, departmentId: string, deletedBy: string) {
    return await db.transaction(async (tx) => {
      const [deleted] = await tx.update(departments)
        .set({ deletedAt: new Date() })
        .where(and(eq(departments.id, departmentId), eq(departments.organizationId, organizationId)))
        .returning();

      await logAudit({
         organizationId,
         userId: deletedBy,
         action: 'DELETE_DEPARTMENT',
         entityType: 'departments',
         entityId: departmentId,
         newData: { deletedAt: true }
      });

      return deleted;
    });
  }
}
