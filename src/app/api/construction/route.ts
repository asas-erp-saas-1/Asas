import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eq, and } from 'drizzle-orm';
import { requireSession } from '@/lib/enterprise/auth';
import { requirePermission } from '@/lib/enterprise/rbac';
import { projects, chantiers, units, contractors, projectMilestones, projectPhases, purchaseOrders, dailyLogs } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'chantiers', 'read');
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');
    const projectId = searchParams.get('projectId');
    const orgId = session.organizationId;

    if (view === 'dashboard') {
      const pCount = await db.select().from(projects).where(eq(projects.organizationId, orgId));
      const cCount = await db.select().from(chantiers).where(eq(chantiers.organizationId, orgId));
      const uCount = await db.select().from(units).where(eq(units.organizationId, orgId));
      const mCount = await db.select().from(projectMilestones).where(eq(projectMilestones.organizationId, orgId));

      return NextResponse.json({
        totalProjects: pCount.length,
        activeChantiers: cCount.filter(c => c.status === 'active').length,
        totalUnits: uCount.length,
        unitStates: {
           under_construction: uCount.filter(u => u.status === 'under_construction').length,
           completed: uCount.filter(u => u.status === 'completed').length,
           sold: uCount.filter(u => u.status === 'sold').length,
        },
        totalContractors: 0,
        milestonesValidated: mCount.filter(m => m.status === 'validated').length,
        milestonesTotal: mCount.length
      });
    }

    if (view === 'project_phases' && projectId) {
      const phases = await db.select().from(projectPhases).where(and(eq(projectPhases.organizationId, orgId), eq(projectPhases.projectId, projectId)));
      return NextResponse.json(phases.map(p => ({ ...p, phase_code: p.name }))); // UI Compat
    }

    if (view === 'chantiers') {
      const cList = await db.select().from(chantiers).where(and(eq(chantiers.organizationId, orgId), projectId ? eq(chantiers.projectId, projectId) : undefined));
      return NextResponse.json(cList);
    }

    if (view === 'purchase_orders' && projectId) {
      const poList = await db.select().from(purchaseOrders).where(and(eq(purchaseOrders.organizationId, orgId), eq(purchaseOrders.projectId, projectId)));
      return NextResponse.json(poList.map(p => ({ ...p, po_number: p.referenceCode, supplier: p.vendorName, amount: Number(p.totalAmount) })));
    }

    if (view === 'daily_logs' && projectId) {
      const cList = await db.select().from(chantiers).where(eq(chantiers.projectId, projectId));
      const cIds = cList.map(c => c.id);
      let logs = [];
      for (const id of cIds) {
        const dLogs = await db.select().from(dailyLogs).where(eq(dailyLogs.chantierId, id));
        logs.push(...dLogs);
      }
      return NextResponse.json(logs.map(l => ({ ...l, date: l.logDate, workers: l.workerCount, notes: l.workCompleted })));
    }

    if (view === 'suppliers') {
       return NextResponse.json([]); // Not implemented
    }
    if (view === 'materials') {
       return NextResponse.json([]); // Not implemented
    }
    if (view === 'contractors') {
       const con = await db.select().from(contractors).where(eq(contractors.organizationId, orgId));
       return NextResponse.json(con);
    }
    if (view === 'units' && projectId) {
       return NextResponse.json([]);
    }
    if (view === 'contractor_assignments') {
       return NextResponse.json([]); // Not implemented
    }
    if (view === 'milestones' && projectId) {
      const mList = await db.select().from(projectMilestones).where(and(eq(projectMilestones.organizationId, orgId), eq(projectMilestones.projectId, projectId)));
      return NextResponse.json(mList);
    }

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    requirePermission(session, 'chantiers', 'write');
    const data = await request.json();
    const orgId = session.organizationId;
    const { action, payload } = data;

    if (action === 'submit_daily_log') {
       const [log] = await db.insert(dailyLogs).values({
         organizationId: orgId,
         chantierId: payload.chantier_id,
         logDate: payload.date || new Date().toISOString().split('T')[0],
         workerCount: parseInt(payload.workers) || 0,
         workCompleted: payload.work_completed,
         incidentsNoted: payload.incidents,
         createdBy: session.userId,
       }).returning();
       return NextResponse.json({ success: true, data: log });
    }

    if (action === 'validate_milestone') {
       const [mile] = await db.update(projectMilestones)
         .set({ status: 'validated', completionDate: new Date().toISOString().split('T')[0] })
         .where(and(eq(projectMilestones.id, payload.milestone_id), eq(projectMilestones.organizationId, orgId)))
         .returning();
       return NextResponse.json({ success: true, data: mile });
    }

    if (action === 'add_expense' || action === 'add_material' || action === 'update_phase') {
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
