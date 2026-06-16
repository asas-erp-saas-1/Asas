import { db } from '@/db';
import { contracts, installments, units, reservations, contacts } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class ContractService {
  static async createContract(
    organizationId: string,
    data: { unitId: string; contactId: string; reservationId?: string; referenceCode: string; agreedPrice: string | number; notes?: string; installmentsData?: Array<{ name: string; amount: string | number; dueDate: string }> },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      // 1. Verify Unit
      const unitList = await tx.select().from(units).where(and(eq(units.id, data.unitId), eq(units.organizationId, organizationId))).limit(1);
      if (!unitList.length) {
         throw new Error('Unit not found');
      }

      // If unit is available, we mark it sold. If it was reserved, we also map it.
      if (data.reservationId) {
         const resList = await tx.select().from(reservations).where(and(eq(reservations.id, data.reservationId), eq(reservations.organizationId, organizationId))).limit(1);
         if (!resList.length) throw new Error('Reservation not found');
         // mark reservation as fulfilled/contracted
         await tx.update(reservations).set({ status: 'contracted', updatedAt: new Date(), updatedBy: createdBy }).where(eq(reservations.id, data.reservationId));
      } else if (unitList[0]!.status !== 'available' && unitList[0]!.status !== 'reserved') {
          throw new Error(`Cannot create contract for unit with status: ${unitList[0]!.status}`);
      }

      // 2. Insert Contract
      const [newContract] = await tx.insert(contracts).values({
        organizationId,
        unitId: data.unitId,
        contactId: data.contactId,
        reservationId: data.reservationId,
        referenceCode: data.referenceCode,
        agreedPrice: String(data.agreedPrice),
        notes: data.notes,
        status: 'draft',
        createdBy
      }).returning();

      // 3. Mark Unit as Sold
      await tx.update(units)
        .set({ status: 'sold', updatedAt: new Date(), updatedBy: createdBy })
        .where(eq(units.id, data.unitId));

      // 4. Generate Installments if provided
      if (data.installmentsData && data.installmentsData.length > 0) {
        const installmentsToInsert = data.installmentsData.map(inst => ({
            organizationId,
            contractId: newContract?.id || '',
            name: inst.name,
            amount: String(inst.amount),
            dueDate: new Date(inst.dueDate).toISOString().split('T')[0],
            status: 'pending'
        }));
        await tx.insert(installments).values(installmentsToInsert as any);
      }

      // 5. Audit
      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_CONTRACT',
        entityType: 'contracts',
        entityId: newContract?.id || '',
        newData: data
      });

      return newContract;
    });
  }

  static async listContracts(organizationId: string) {
    return await db.select({
      id: contracts.id,
      unitId: contracts.unitId,
      contactId: contracts.contactId,
      referenceCode: contracts.referenceCode,
      status: contracts.status,
      agreedPrice: contracts.agreedPrice,
      signedDate: contracts.signedDate,
      contact: {
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        companyName: contacts.companyName
      },
      unit: {
        referenceCode: units.referenceCode
      }
    })
    .from(contracts)
    .leftJoin(contacts, eq(contracts.contactId, contacts.id))
    .leftJoin(units, eq(contracts.unitId, units.id))
    .where(and(eq(contracts.organizationId, organizationId), isNull(contracts.deletedAt)));
  }

  static async signContract(organizationId: string, contractId: string, signedBy: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(contracts)
        .set({ status: 'active', signedDate: new Date(), updatedAt: new Date(), updatedBy: signedBy })
        .where(and(eq(contracts.id, contractId), eq(contracts.organizationId, organizationId)))
        .returning();

      if (!updated) {
         throw new Error('Contract not found');
      }

      await logAudit({
        organizationId,
        userId: signedBy,
        action: 'SIGN_CONTRACT',
        entityType: 'contracts',
        entityId: contractId,
        newData: { status: 'active' }
      });

      return updated;
    });
  }
}
