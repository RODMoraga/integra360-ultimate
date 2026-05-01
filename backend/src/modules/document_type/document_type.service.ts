import { document_types_counterpart_scope } from "@prisma/client";
import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  documentTypeRepository,
  type CreateDocumentTypeInput,
  type UpdateDocumentTypeInput
} from "./document_type.repository";

/**
 * Business layer for document type operations.
 */
class DocumentTypeService {
  /**
   * Lists all document types.
   */
  async list() {
    const rows = await documentTypeRepository.findAll();
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one document type by id.
   */
  async getById(id: bigint) {
    const documentType = await documentTypeRepository.findById(id);
    if (!documentType) {
      throw new AppError("Tipo de documento no encontrado", 404);
    }

    return this.serialize(documentType);
  }

  /**
   * Creates one document type after unique-code validation.
   */
  async create(dto: CreateDocumentTypeDto) {
    const existing = await documentTypeRepository.findByCode(dto.code);
    if (existing) {
      throw new AppError("El código del tipo de documento ya existe", 409);
    }

    const payload: CreateDocumentTypeInput = {
      code: dto.code,
      name: dto.name,
      counterpart_scope: dto.counterpart_scope,
      affects_inventory: dto.affects_inventory,
      affects_accounting: dto.affects_accounting
    };

    const created = await documentTypeRepository.create(payload);
    return this.serialize(created);
  }

  /**
   * Updates one document type.
   */
  async update(id: bigint, dto: UpdateDocumentTypeDto) {
    await this.getById(id);

    const payload: UpdateDocumentTypeInput = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.counterpart_scope !== undefined && { counterpart_scope: dto.counterpart_scope }),
      ...(dto.affects_inventory !== undefined && { affects_inventory: dto.affects_inventory }),
      ...(dto.affects_accounting !== undefined && { affects_accounting: dto.affects_accounting })
    };

    const updated = await documentTypeRepository.update(id, payload);
    return this.serialize(updated);
  }

  /**
   * Soft-deletes one document type.
   * The record is marked with deleted_at and excluded from all active queries.
   * Existing FK dependencies (documents, sequences) remain intact.
   */
  async remove(id: bigint) {
    const documentType = await documentTypeRepository.findById(id);
    if (!documentType) {
      throw new AppError("Tipo de documento no encontrado", 404);
    }

    await documentTypeRepository.remove(id);
  }

  private counterpartScopeLabel(scope: document_types_counterpart_scope) {
    if (scope === "CUSTOMER") return "Cliente";
    if (scope === "SUPPLIER") return "Proveedor";
    return "Ninguno";
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(documentType: any) {
    const documentsCount = Number(documentType._count?.documents ?? 0);
    const sequencesCount = Number(documentType._count?.document_sequences ?? 0);

    return {
      id: documentType.id.toString(),
      code: documentType.code,
      name: documentType.name,
      counterpart_scope: documentType.counterpart_scope,
      counterpart_scope_label: this.counterpartScopeLabel(documentType.counterpart_scope),
      affects_inventory: documentType.affects_inventory,
      affects_accounting: documentType.affects_accounting,
      documents_count: documentsCount,
      document_sequences_count: sequencesCount,
      dependencies_count: documentsCount + sequencesCount,
      created_at: toUtcIsoString(documentType.created_at)
    };
  }
}

export const documentTypeService = new DocumentTypeService();

type CreateDocumentTypeDto = {
  code: string;
  name: string;
  counterpart_scope: document_types_counterpart_scope;
  affects_inventory: boolean;
  affects_accounting: boolean;
};

type UpdateDocumentTypeDto = {
  name?: string;
  counterpart_scope?: document_types_counterpart_scope;
  affects_inventory?: boolean;
  affects_accounting?: boolean;
};
