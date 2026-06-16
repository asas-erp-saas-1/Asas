import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { ErrorTracker } from '@/lib/observability/errors';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Proxy permission for HR/attendance
    requirePermission(session, 'users', 'read'); 

    // Mocking response due to missing attendance table in enterprise schema
    const mockData = [
       {
         id: "mock1",
         userId: session.userId,
         date: new Date(),
         timeIn: new Date(),
         status: 'present',
         location: 'Office',
         user: {
           id: session.userId,
           name: "Current User",
           role: session.role
         }
       }
    ];

    return NextResponse.json({ 
       data: mockData, 
       stats: {
           totalEmployees: 1,
           present: 1,
           onSite: 1,
           late: 0,
           absent: 0,
           attendanceRate: "100.0"
       },
       count: mockData.length 
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/attendance' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'users', 'write');

    const body = await request.json();
    const { userId, status, location } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const mockRecord = {
      id: "mock_" + Date.now(),
      userId: userId,
      date: new Date(),
      timeIn: new Date(),
      status: status || 'present',
      location: location,
    };

    return NextResponse.json({ data: mockRecord }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
       return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/attendance' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
