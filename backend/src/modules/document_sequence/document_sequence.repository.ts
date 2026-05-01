import { prisma } from "../../config/database";

/**
 * Contract for creating one document sequence row.
 */
export interface CreateDocumentSequenceInput {
  company_id: bigint;
  document_type_id: bigint;
  year_num: number;
  next_number: bigint;
}

/**
 * Contract for partial sequence updates.
 */
export interface UpdateDocumentSequenceInput {
  document_type_id?: bigint;
  year_num?: number;
  next_number?: bigint;
}

/**
 * Repository layer for direct persistence operations over `document_sequences`.
 */
class DocumentSequenceRepository {
  /**
   * Retrieves sequences for one company ordered by year and id.
   */
  findAll(companyId: bigint) {
    return prisma.document_sequences.findMany({
      where: { company_id: companyId },
      include: {
        document_types: {
          select: {
            id: true,
            code: true,
            name: true,
            deleted_at: true
          }
        }
      },
      orderBy: [{ year_num: "desc" }, { id: "desc" }]
    });
  }

  /**
   * Finds one sequence by id in company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.document_sequences.findFirst({
      where: {
        id,
        company_id: companyId
      },
      include: {
        document_types: {
          select: {
            id: true,
            code: true,
            name: true,
            deleted_at: true
          }
        }
      }
    });
  }

  /**
   * Finds one sequence by unique scope in company context.
   */
  findByScope(companyId: bigint, documentTypeId: bigint, yearNum: number, excludeId?: bigint) {
    return prisma.document_sequences.findFirst({
      where: {
        company_id: companyId,
        document_type_id: documentTypeId,
        year_num: yearNum,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds one active document type.
   */
  findDocumentTypeById(documentTypeId: bigint) {
    return prisma.document_types.findFirst({
      where: {
        id: documentTypeId,
        deleted_at: null
      },
      select: {
        id: true,
        code: true,
        name: true
      }
    });
  }

  /**
   * Persists one sequence row.
   */
  create(data: CreateDocumentSequenceInput) {
    const now = new Date();
    return prisma.document_sequences.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  /**
   * Updates one sequence in company scope.
   */
  update(companyId: bigint, id: bigint, data: UpdateDocumentSequenceInput) {
    return prisma.document_sequences.updateMany({
      where: {
        id,
        company_id: companyId
      },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  }

  /**
   * Deletes one sequence in company scope.
   */
  remove(companyId: bigint, id: bigint) {
    return prisma.document_sequences.deleteMany({
      where: {
        id,
        company_id: companyId
      }
    });
  }
}

export const documentSequenceRepository = new DocumentSequenceRepository();
