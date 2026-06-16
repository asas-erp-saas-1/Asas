import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ErrorTracker } from '@/lib/observability/errors';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Proxy permission for vendors via deals or general read
    requirePermission(session, 'deals', 'read');

    // Mock response since vendors isn't currently in enterprise schema
    const vendorsResult = [
       {
           id: 1,
           name: "Acme Logistics",
           type: 'contractor',
           specialty: 'Transport',
           contactEmail: 'contact@acme.com',
           contactPhone: '555-0102',
           status: 'active',
           createdAt: new Date().toISOString()
       }
    ];

    return NextResponse.json({ data: vendorsResult, count: vendorsResult.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/vendors' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'deals', 'write');

    const body = await request.json();
    const { name, type, specialty, contactEmail, contactPhone, status } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Vendor name is required' }, { status: 400 });
    }

    const newVendor = {
      id: Date.now(),
      name,
      type: type || 'contractor',
      specialty,
      contactEmail,
      contactPhone,
      status: status || 'active',
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ data: newVendor }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/vendors' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
