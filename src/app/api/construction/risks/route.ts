import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ErrorTracker } from '@/lib/observability/errors';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Proxy permission for construction
    requirePermission(session, 'deals', 'read');

    // Mock response since projectRisks isn't currently in enterprise schema
    const formatted = [
       {
           id: `RSK-01`,
           projectId: "P-1",
           project: 'Alpha Residence',
           type: 'Delay',
           description: 'Supply chain constraints on materials.',
           severity: 'medium',
           status: 'monitoring',
           delayImpact: '1-2 weeks',
           createdAt: new Date().toISOString()
       }
    ];

    return NextResponse.json({ data: formatted, count: formatted.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/construction/risks' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write');

    const body = await request.json();
    const { projectId, description } = body;
    
    if (!projectId || !description) {
      return NextResponse.json({ error: 'projectId and description are required' }, { status: 400 });
    }

    const mockRisk = {
      id: "mock_" + Date.now(),
      projectId: projectId,
      description: description,
      severity: 'medium',
      status: 'monitoring',
    };

    return NextResponse.json({ data: mockRisk }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/construction/risks' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
