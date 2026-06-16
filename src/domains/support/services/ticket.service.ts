import { db } from '@/db';
import { tickets, contacts, users } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class TicketService {
  static async createTicket(
    organizationId: string,
    data: { contactId?: string; assignedToId?: string; subject: string; description?: string; priority?: string; category?: string },
    reportedById: string
  ) {
    return await db.transaction(async (tx) => {
      const [newTicket] = await tx.insert(tickets).values({
        organizationId,
        ...data,
        reportedById,
        status: 'open',
        createdBy: reportedById
      }).returning();

      await logAudit({
        organizationId,
        userId: reportedById,
        action: 'CREATE_TICKET',
        entityType: 'tickets',
        entityId: newTicket?.id || '',
        newData: data
      });

      return newTicket;
    });
  }

  static async listTickets(organizationId: string, status?: string) {
    let baseWhere = and(eq(tickets.organizationId, organizationId), isNull(tickets.deletedAt));
    if (status) {
       baseWhere = and(baseWhere, eq(tickets.status, status));
    }

    return await db.select({
      id: tickets.id,
      subject: tickets.subject,
      status: tickets.status,
      priority: tickets.priority,
      category: tickets.category,
      createdAt: tickets.createdAt,
      contact: {
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        companyName: contacts.companyName
      },
      assignedTo: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(tickets)
    .leftJoin(contacts, eq(tickets.contactId, contacts.id))
    .leftJoin(users, eq(tickets.assignedToId, users.id))
    .where(baseWhere);
  }

  static async updateTicketStatus(organizationId: string, ticketId: string, status: string, updatedBy: string) {
    return await db.transaction(async (tx) => {
      const updates: any = { status, updatedAt: new Date(), updatedBy };
      if (status === 'resolved' || status === 'closed') {
         updates.resolvedAt = new Date();
      }

      const [updated] = await tx.update(tickets)
        .set(updates)
        .where(and(eq(tickets.id, ticketId), eq(tickets.organizationId, organizationId)))
        .returning();

      if (!updated) {
        throw new Error('Ticket not found');
      }

      await logAudit({
         organizationId,
         userId: updatedBy,
         action: 'UPDATE_TICKET_STATUS',
         entityType: 'tickets',
         entityId: ticketId,
         newData: { status }
      });

      return updated;
    });
  }
}
