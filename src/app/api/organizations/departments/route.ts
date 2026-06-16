import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { DepartmentService } from '@/domains/organizations/services/department.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Assuming users can read departments
    
    const list = await DepartmentService.listDepartments(session.organizationId);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/organizations/departments' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'organizations', 'admin'); 

    const body = await request.json();
    const { name, parentId, managerId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const newDept = await DepartmentService.createDepartment(
      session.organizationId,
      name,
      parentId || null,
      managerId || null,
      session.userId
    );

    return NextResponse.json({ data: newDept }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/organizations/departments' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
