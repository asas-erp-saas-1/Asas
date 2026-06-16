import { NextResponse } from 'next/server';
import { db } from '@/db';
import { organizations, roles, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { getSession } from '@/lib/enterprise/auth';

export async function POST(request: Request) {
  try {
    // 1. Safety Check: If users already exist, require a super_admin/admin session to proceed
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      const session = await getSession();
      if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
         return NextResponse.json({ error: 'Unauthorized: Seeding is locked once a system user exists. Only admins can perform this action.' }, { status: 403 });
      }
    }

    // 1. Create Organization
    let org = await db.select().from(organizations).where(eq(organizations.slug, 'asas_holdings')).limit(1);
    
    if (org.length === 0) {
       org = await db.insert(organizations).values({
         name: 'ASAS Holdings',
         slug: 'asas_holdings',
         plan: 'enterprise'
       } as any).returning();
    }

    const orgId = org[0]!.id;

    // 2. Create Roles
    let adminRole = await db.select().from(roles).where(eq(roles.name, 'Super Admin')).limit(1);
    
    if (adminRole.length === 0) {
       adminRole = await db.insert(roles).values({
         organizationId: orgId,
         name: 'Super Admin',
         permissions: ['*:*']
       } as any).returning();
    }

    const roleId = adminRole[0]!.id;

    // 3. Create initial Admin User
    let adminUser = await db.select().from(users).where(eq(users.email, 'admin@asas.dz')).limit(1);

    if (adminUser.length === 0) {
       adminUser = await db.insert(users).values({
         organizationId: orgId,
         email: 'admin@asas.dz',
         firstName: 'Karim',
         lastName: 'System Admin',
         roleId: roleId,
         role: 'admin',
         department: 'IT & Security'
       } as any).returning();
    }

    // 4. Fallback updating old unassigned data to this organization
    // ... just an example
    
    return NextResponse.json({ 
       message: 'Enterprise tenants and RBAC seeded.',
       organization: org[0],
       role: adminRole[0],
       user: adminUser[0]
    });

  } catch (error: any) {
    ErrorTracker.captureError(error, { context: 'Seed Tenant API' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
