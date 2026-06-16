import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { EmployeeService } from '@/domains/hr/services/employee.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'hr', 'read');

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId') || undefined;

    const list = await EmployeeService.listEmployees(session.organizationId, departmentId);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/hr/employees' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'hr', 'write');

    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json({ error: 'Missing required field: userId' }, { status: 400 });
    }

    const newEmp = await EmployeeService.createEmployee(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newEmp }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/hr/employees' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
