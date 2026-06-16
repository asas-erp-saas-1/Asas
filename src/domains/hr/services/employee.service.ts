import { db } from '@/db';
import { employees, users, departments } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class EmployeeService {
  static async createEmployee(
    organizationId: string,
    data: { userId: string; departmentId?: string; employeeNumber?: string; jobTitle?: string; hireDate?: string; employmentStatus?: string; salary?: number | string; currency?: string },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newEmployee] = await tx.insert(employees).values({
        organizationId,
        ...data,
        hireDate: data.hireDate ? new Date(data.hireDate).toISOString().split('T')[0] : undefined,
        salary: data.salary !== undefined ? String(data.salary) : undefined,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_EMPLOYEE',
        entityType: 'employees',
        entityId: newEmployee?.id || '',
        newData: data
      });

      return newEmployee;
    });
  }

  static async listEmployees(organizationId: string, departmentId?: string) {
    let baseWhere = and(eq(employees.organizationId, organizationId), isNull(employees.deletedAt));
    if (departmentId) {
       baseWhere = and(baseWhere, eq(employees.departmentId, departmentId));
    }

    return await db.select({
      id: employees.id,
      employeeNumber: employees.employeeNumber,
      jobTitle: employees.jobTitle,
      hireDate: employees.hireDate,
      employmentStatus: employees.employmentStatus,
      salary: employees.salary,
      currency: employees.currency,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      },
      department: {
        id: departments.id,
        name: departments.name
      }
    })
    .from(employees)
    .leftJoin(users, eq(employees.userId, users.id))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .where(baseWhere);
  }

  static async updateEmployeeStatus(organizationId: string, employeeId: string, status: string, updatedBy: string) {
    return await db.transaction(async (tx) => {
       const [updated] = await tx.update(employees)
         .set({ employmentStatus: status, updatedAt: new Date(), updatedBy })
         .where(and(eq(employees.id, employeeId), eq(employees.organizationId, organizationId)))
         .returning();

       if (!updated) {
           throw new Error('Employee not found');
       }

       await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'UPDATE_EMPLOYEE_STATUS',
        entityType: 'employees',
        entityId: employeeId,
        newData: { status }
       });

       return updated;
    });
  }
}
