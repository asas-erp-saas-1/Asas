import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { DepartmentService } from '@/domains/organizations/services/department.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'departments', 'admin');

    const { departmentId } = await params;
    const body = await request.json();
    const { name, parentId, managerId } = body;

    const updatedDept = await DepartmentService.updateDepartment(
      session.organizationId,
      departmentId,
      { name, parentId, managerId },
      session.userId
    );

    return NextResponse.json({ data: updatedDept }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/departments/[id]' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'departments', 'admin');

    const { departmentId } = await params;

    const deleted = await DepartmentService.deleteDepartment(
      session.organizationId,
      departmentId,
      session.userId
    );

    return NextResponse.json({ data: deleted }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'DELETE /api/departments/[id]' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
