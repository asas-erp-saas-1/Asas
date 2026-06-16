import { getTenantDb } from '@/db';
import { reservations, units, contacts } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class ReservationService {
  static async createReservation(
    organizationId: string,
    data: { unitId: string; contactId: string; expirationDate: string; depositAmount?: number | string; notes?: string },
    createdBy: string
  ) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      // 1. Verify unit availability with FOR UPDATE lock to prevent race conditions
      const unit = await tx.select()
        .from(units)
        .where(and(eq(units.id, data.unitId), eq(units.organizationId, organizationId)))
        .limit(1)
        .for('update');
        
      if (!unit.length) {
        throw new Error('Unit not found');
      }

      if (unit[0]!.status !== 'available') {
        throw new Error(`Unit is not available, current status is: ${unit[0]!.status}`);
      }

      // 2. Create Reservation
      const [newRes] = await tx.insert(reservations).values({
        organizationId,
        unitId: data.unitId,
        contactId: data.contactId,
        expirationDate: new Date(data.expirationDate).toISOString().split('T')[0],
        depositAmount: data.depositAmount !== undefined ? String(data.depositAmount) : undefined,
        notes: data.notes,
        status: 'active',
        createdBy
      } as any).returning();

      // 3. Update Unit status to 'reserved'
      await tx.update(units)
        .set({ status: 'reserved', updatedAt: new Date(), updatedBy: createdBy })
        .where(eq(units.id, data.unitId));

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_RESERVATION',
        entityType: 'reservations',
        entityId: newRes?.id || '',
        newData: data
      });

      return newRes;
    });
  }

  static async listReservations(organizationId: string, status?: string) {
    let baseWhere = and(eq(reservations.organizationId, organizationId), isNull(reservations.deletedAt));
    if (status) {
      baseWhere = and(baseWhere, eq(reservations.status, status));
    }

    return await getTenantDb(organizationId).select({
      id: reservations.id,
      unitId: reservations.unitId,
      contactId: reservations.contactId,
      status: reservations.status,
      expirationDate: reservations.expirationDate,
      depositAmount: reservations.depositAmount,
      contact: {
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        phone: contacts.phone
      },
      unit: {
        referenceCode: units.referenceCode
      }
    })
    .from(reservations)
    .leftJoin(contacts, eq(reservations.contactId, contacts.id))
    .leftJoin(units, eq(reservations.unitId, units.id))
    .where(baseWhere);
  }

  static async cancelReservation(organizationId: string, reservationId: string, updatedBy: string) {
    return await getTenantDb(organizationId).transaction(async (tx) => {
      const resList = await tx.select().from(reservations).where(and(eq(reservations.id, reservationId), eq(reservations.organizationId, organizationId))).limit(1);
      
      if (!resList.length) {
         throw new Error('Reservation not found');
      }

      const res = resList[0];

      if (res?.status === 'cancelled' || res?.status === 'expired') {
          throw new Error('Reservation is already cancelled or expired');
      }

      const [updated] = await tx.update(reservations)
        .set({ status: 'cancelled', updatedAt: new Date(), updatedBy })
        .where(eq(reservations.id, reservationId))
        .returning();

      // Free up the unit
      await tx.update(units)
        .set({ status: 'available', updatedAt: new Date(), updatedBy })
        .where(eq(units.id, res!.unitId!));

      await logAudit({
        organizationId,
        userId: updatedBy,
        action: 'CANCEL_RESERVATION',
        entityType: 'reservations',
        entityId: reservationId,
        newData: { status: 'cancelled', previousStatus: res?.status }
      });

      return updated;
    });
  }
}
