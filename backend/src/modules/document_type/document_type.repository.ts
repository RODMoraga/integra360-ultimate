import { prisma } from "../../config/database";
import { document_types_counterpart_scope } from "@prisma/client";

/**
 * Contract for document type creation payload.
 */
export interface CreateDocumentTypeInput {
  code: string;
  name: string;
  counterpart_scope?: document_types_counterpart_scope;
  affects_inventory?: boolean;
  affects_accounting?: boolean;
}

/**
 * Contract for partial document type updates.
 */
export interface UpdateDocumentTypeInput {
  name?: string;
  counterpart_scope?: document_types_counterpart_scope;
  affects_inventory?: boolean;
  affects_accounting?: boolean;
}

/**
 * Repository layer for direct persistence operations over `document_types`.
 */
class DocumentTypeRepository {
  /**
   * Retrieves all active (non-deleted) document types ordered by code.
   */
  findAll() {
    return prisma.document_types.findMany({
      where: { deleted_at: null },
      include: {
        _count: {
          select: {
            documents: true,
            document_sequences: true
          }
        }
      },
      orderBy: [{ code: "asc" }]
    });
  }

  /**
   * Finds one active document type by id.
   */
  findById(id: bigint) {
    return prisma.document_types.findFirst({
      where: { id, deleted_at: null },
      include: {
        _count: {
          select: {
            documents: true,
            document_sequences: true
          }
        }
      }
    });
  }

  /**
   * Finds one active document type by code.
   * Soft-deleted records are excluded so a code can be recycled after deletion.
   */
  findByCode(code: string) {
    return prisma.document_types.findFirst({ where: { code, deleted_at: null } });
  }

  /**
   * Creates one document type record.
   */
  create(data: CreateDocumentTypeInput) {
    return prisma.document_types.create({
      data: {
        ...data,
        created_at: new Date()
      },
      include: {
        _count: {
          select: {
            documents: true,
            document_sequences: true
          }
        }
      }
    });
  }

  /**
   * Updates one document type record.
   */
  update(id: bigint, data: UpdateDocumentTypeInput) {
    return prisma.document_types.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            documents: true,
            document_sequences: true
          }
        }
      }
    });
  }

  /**
   * Soft-deletes one document type record by setting deleted_at.
   */
  remove(id: bigint) {
    return prisma.document_types.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

export const documentTypeRepository = new DocumentTypeRepository();
