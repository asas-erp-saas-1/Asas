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
    requirePermission(session, 'organizations', 'admin');

    const { departmentId } = await params;
    const body = await request.json();

    const updated = await DepartmentService.updateDepartment(
      session.organizationId,
      departmentId,
      body,
      session.userId
    );

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'PATCH /api/organizations/departments/[id]' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ departmentId: string }> }
) {
  try {
    const session = await requireSession();
    requirePermission(session, 'organizations', 'admin');

    const { departmentId } = await params;

    const result = await DepartmentService.deleteDepartment(
      session.organizationId,
      departmentId,
      session.userId
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'DELETE /api/organizations/departments/[id]' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
