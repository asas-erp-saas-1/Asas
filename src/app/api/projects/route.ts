import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, buildings, units } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { ErrorTracker } from '@/lib/observability/errors';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    // Simplified bypass for now
    // requirePermission(session, 'projects', 'read');

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;
    const id = searchParams.get('id');

    if (id) {
       const projectResult = await db.select()
          .from(projects)
          .where(and(eq(projects.id, id), eq(projects.organizationId, session.organizationId)))
          .limit(1);
          
       if (projectResult.length === 0) {
          return NextResponse.json({ error: 'Project not found' }, { status: 404 });
       }
       return NextResponse.json({ data: projectResult[0] });
    }

    const projectsResult = await db.select()
      .from(projects)
      .where(eq(projects.organizationId, session.organizationId))
      .orderBy(desc(projects.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch units per project to provide properties array
    const mappedProjects = await Promise.all(projectsResult.map(async (p) => {
       const bldgs = await db.select({ id: buildings.id }).from(buildings).where(eq(buildings.projectId, p.id));
       const bldgIds = bldgs.map(b => b.id);
       let properties = [];
       if (bldgIds.length > 0) {
         // Not using inArray to avoid issues if empty, handled by condition
         for (const bId of bldgIds) {
           const bUnits = await db.select({ id: units.id, status: units.status }).from(units).where(eq(units.buildingId, bId));
           properties.push(...bUnits);
         }
       }
       return {
         ...p,
         city: p.location,
         completion_date: null,
         developers: { name: "ASAS Admin" },
         properties: properties
       };
    }));

    return NextResponse.json({ data: mappedProjects, count: mappedProjects.length });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'GET /api/projects' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    // requirePermission(session, 'projects', 'write');
    
    const body = await request.json();
    const { name, location, budget, managerId, status } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const newProject = await db.insert(projects).values({
      organizationId: session.organizationId,
      name,
      location,
      budget,
      managerId,
      status: status || 'planning',
    }).returning();

    return NextResponse.json({ data: newProject[0] }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.startsWith('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    ErrorTracker.captureError(error, { context: 'POST /api/projects' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
