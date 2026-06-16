import { db } from '@/db';
import { documentTemplates, documents, signatures, contacts } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logAudit } from '@/lib/enterprise/audit';

export class DocumentService {
  static async createTemplate(
    organizationId: string,
    data: { name: string; type: string; body: string },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newTemplate] = await tx.insert(documentTemplates).values({
        organizationId,
        ...data,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_DOCUMENT_TEMPLATE',
        entityType: 'documentTemplates',
        entityId: newTemplate?.id || '',
        newData: data
      });

      return newTemplate;
    });
  }

  static async listTemplates(organizationId: string) {
    return await db.select()
      .from(documentTemplates)
      .where(and(eq(documentTemplates.organizationId, organizationId), isNull(documentTemplates.deletedAt)));
  }

  static async createDocument(
    organizationId: string,
    data: { templateId?: string; entityType: string; entityId: string; name: string; fileUrl: string; fileType?: string; fileSize?: number },
    createdBy: string
  ) {
    return await db.transaction(async (tx) => {
      const [newDocument] = await tx.insert(documents).values({
        organizationId,
        ...data,
        createdBy
      }).returning();

      await logAudit({
        organizationId,
        userId: createdBy,
        action: 'CREATE_DOCUMENT',
        entityType: 'documents',
        entityId: newDocument?.id || '',
        newData: data
      });

      return newDocument;
    });
  }

  static async listDocuments(organizationId: string, entityType?: string, entityId?: string) {
    let baseWhere = and(eq(documents.organizationId, organizationId), isNull(documents.deletedAt));
    if (entityType && entityId) {
        baseWhere = and(baseWhere, eq(documents.entityType, entityType), eq(documents.entityId, entityId));
    }

    return await db.select()
      .from(documents)
      .where(baseWhere);
  }

  static async signDocument(organizationId: string, documentId: string, contactId: string, signatureData: any, signedByUserId: string) {
    return await db.transaction(async (tx) => {
       const [sig] = await tx.insert(signatures).values({
           organizationId,
           documentId,
           contactId,
           status: 'signed',
           signedAt: new Date(),
           signatureData,
           createdBy: signedByUserId
       }).returning();

       await logAudit({
        organizationId,
        userId: signedByUserId,
        action: 'SIGN_DOCUMENT',
        entityType: 'signatures',
        entityId: sig?.id || '',
        newData: { status: 'signed' }
      });

      return sig;
    });
  }
}
