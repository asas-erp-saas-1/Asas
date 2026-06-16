import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ErrorTracker } from '@/lib/observability/errors';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Proxy permission for HR
    requirePermission(session, 'users', 'read');

    // Mock response since recruitment isn't currently in enterprise schema
    const formatted = [
       {
           id: `CND-1`,
           name: `Alice Dupont`,
           role: 'Project Manager',
           status: 'Nouveau',
           appliedAt: new Date().toISOString().split('T')[0],
           score: 85,
       }
    ];

    const stats = {
       openRoles: 3, 
       activeCandidates: 12, 
       interviews: 2 
    };

    return NextResponse.json({ 
       data: formatted, 
       stats: stats 
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/recruitment' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
