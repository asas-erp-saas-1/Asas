import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { DocumentService } from '@/domains/documents/services/document.service';
import { ErrorTracker } from '@/lib/observability/errors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'documents', 'read');

    const templates = await DocumentService.listTemplates(session.organizationId);
    return NextResponse.json({ data: templates }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/documents/templates' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'documents', 'admin');

    const body = await request.json();

    if (!body.name || !body.type || !body.body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTemplate = await DocumentService.createTemplate(
      session.organizationId,
      body,
      session.userId
    );

    return NextResponse.json({ data: newTemplate }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/documents/templates' });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
