import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class NotificationService {
  static async createNotification(
    organizationId: string,
    data: { userId: string; type: string; title: string; message?: string; actionUrl?: string },
    createdBy: string // system or user
  ) {
    return await db.transaction(async (tx) => {
      const [newNotif] = await tx.insert(notifications).values({
        organizationId,
        ...data,
      }).returning();

      return newNotif;
    });
  }

  static async listNotifications(organizationId: string, userId: string, unreadOnly: boolean = false) {
    let baseWhere = and(eq(notifications.organizationId, organizationId), eq(notifications.userId, userId));
    if (unreadOnly) {
      baseWhere = and(baseWhere, eq(notifications.isRead, false));
    }

    return await db.select()
      .from(notifications)
      .where(baseWhere);
  }

  static async markAsRead(organizationId: string, notificationId: string, userId: string) {
    return await db.transaction(async (tx) => {
      const [updated] = await tx.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.organizationId, organizationId), eq(notifications.userId, userId)))
        .returning();

      if (!updated) {
        throw new Error('Notification not found or unauthorized');
      }

      return updated;
    });
  }
}
