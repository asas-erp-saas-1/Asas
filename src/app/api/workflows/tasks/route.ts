import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { WorkflowService } from '@/domains/workflows/services/workflow.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'workflows', 'read');

    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo') || undefined;

    const list = await WorkflowService.listTasks(session.organizationId, assignedTo);

    return NextResponse.json({ data: list }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/workflows/tasks' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'workflows', 'write');

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
    }

    const newTask = await WorkflowService.createTask(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newTask }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/workflows/tasks' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
