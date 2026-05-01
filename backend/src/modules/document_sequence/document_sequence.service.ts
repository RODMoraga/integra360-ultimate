import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  documentSequenceRepository,
  type CreateDocumentSequenceInput,
  type UpdateDocumentSequenceInput
} from "./document_sequence.repository";

/**
 * Business layer for document sequence operations.
 */
class DocumentSequenceService {
  /**
   * Lists sequences in company scope.
   */
  async list(companyId: bigint) {
    const rows = await documentSequenceRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one sequence by id in company scope.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await documentSequenceRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Secuencia de documento no encontrada", 404);
    }

    return this.serialize(row);
  }

  /**
   * Creates one sequence with scope uniqueness validation.
   */
  async create(companyId: bigint, dto: CreateDocumentSequenceDto) {
    const documentTypeId = BigInt(dto.document_type_id);

    const documentType = await documentSequenceRepository.findDocumentTypeById(documentTypeId);
    if (!documentType) {
      throw new AppError("Tipo de documento no encontrado o inactivo", 404);
    }

    const existing = await documentSequenceRepository.findByScope(
      companyId,
      documentTypeId,
      dto.year_num
    );
    if (existing) {
      throw new AppError("Ya existe una secuencia para ese tipo de documento y año", 409);
    }

    const created = await documentSequenceRepository.create({
      company_id: companyId,
      document_type_id: documentTypeId,
      year_num: dto.year_num,
      next_number: BigInt(dto.next_number)
    } satisfies CreateDocumentSequenceInput);

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one sequence with uniqueness validation.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateDocumentSequenceDto) {
    const current = await documentSequenceRepository.findById(companyId, id);
    if (!current) {
      throw new AppError("Secuencia de documento no encontrada", 404);
    }

    const nextDocumentTypeId = dto.document_type_id !== undefined
      ? BigInt(dto.document_type_id)
      : current.document_type_id;
    const nextYearNum = dto.year_num ?? current.year_num;

    if (dto.document_type_id !== undefined) {
      const documentType = await documentSequenceRepository.findDocumentTypeById(nextDocumentTypeId);
      if (!documentType) {
        throw new AppError("Tipo de documento no encontrado o inactivo", 404);
      }
    }

    const duplicate = await documentSequenceRepository.findByScope(
      companyId,
      nextDocumentTypeId,
      nextYearNum,
      id
    );
    if (duplicate) {
      throw new AppError("Ya existe una secuencia para ese tipo de documento y año", 409);
    }

    await documentSequenceRepository.update(companyId, id, {
      ...(dto.document_type_id !== undefined && { document_type_id: nextDocumentTypeId }),
      ...(dto.year_num !== undefined && { year_num: dto.year_num }),
      ...(dto.next_number !== undefined && { next_number: BigInt(dto.next_number) })
    } satisfies UpdateDocumentSequenceInput);

    return this.getById(companyId, id);
  }

  /**
   * Deletes one sequence in company scope.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await documentSequenceRepository.remove(companyId, id);
  }

  /**
   * Normalizes Prisma entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      document_type_id: row.document_type_id.toString(),
      document_type_code: row.document_types?.code ?? null,
      document_type_name: row.document_types?.name ?? null,
      document_type_is_active: row.document_types?.deleted_at == null,
      year_num: row.year_num,
      next_number: row.next_number.toString(),
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const documentSequenceService = new DocumentSequenceService();

type CreateDocumentSequenceDto = {
  document_type_id: number;
  year_num: number;
  next_number: number;
};

type UpdateDocumentSequenceDto = {
  document_type_id?: number;
  year_num?: number;
  next_number?: number;
};
