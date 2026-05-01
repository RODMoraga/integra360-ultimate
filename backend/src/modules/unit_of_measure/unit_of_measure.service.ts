import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  unitOfMeasureRepository,
  CreateUnitOfMeasureInput,
  UpdateUnitOfMeasureInput
} from "./unit_of_measure.repository";

/**
 * Business layer for units_of_measure operations.
 */
class UnitOfMeasureService {
  /**
   * Lists active units for the given company.
   */
  async list(companyId: bigint) {
    const rows = await unitOfMeasureRepository.findAll(companyId);
    return rows.map(this.serialize);
  }

  /**
   * Returns one unit by id within company scope.
   * @throws AppError when the record does not exist.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await unitOfMeasureRepository.findById(companyId, id);
    if (!row) throw new AppError("Unidad de medida no encontrada", 404);
    return this.serialize(row);
  }

  /**
   * Creates a new unit of measure.
   * @throws AppError when `code` already exists for the company.
   */
  async create(
    companyId: bigint,
    dto: Omit<CreateUnitOfMeasureInput, "company_id">
  ) {
    const existing = await unitOfMeasureRepository.findByCode(companyId, dto.code);
    if (existing) throw new AppError("El código de unidad ya existe para esta empresa", 409);

    const data: CreateUnitOfMeasureInput = { ...dto, company_id: companyId };
    let row = await unitOfMeasureRepository.create(data);

    if (dto.is_base_unit) {
      row = await unitOfMeasureRepository.rebaseBaseUnit(
        companyId,
        dto.unit_type,
        row.id
      );
    }

    return this.serialize(row);
  }

  /**
   * Updates an existing unit of measure.
   * @throws AppError when the record does not exist.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateUnitOfMeasureInput) {
    const existing = await unitOfMeasureRepository.findById(companyId, id);
    if (!existing) throw new AppError("Unidad de medida no encontrada", 404);

    const targetUnitType = dto.unit_type ?? existing.unit_type;
    const targetIsBase = dto.is_base_unit ?? existing.is_base_unit;

    let updated = await unitOfMeasureRepository.update(id, dto);
    if (targetIsBase) {
      updated = await unitOfMeasureRepository.rebaseBaseUnit(
        companyId,
        targetUnitType,
        id
      );
    }

    return this.serialize(updated);
  }

  /**
   * Soft-deletes a unit of measure.
   * @throws AppError when the record does not exist or is referenced by products.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);

    const productCount = await unitOfMeasureRepository.countProducts(id);
    if (productCount > 0) {
      throw new AppError(
        `No se puede eliminar: ${productCount} producto(s) usan esta unidad de medida`,
        409
      );
    }

    await unitOfMeasureRepository.softDelete(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      code: row.code,
      name: row.name,
      symbol: row.symbol,
      unit_type: row.unit_type,
      is_base_unit: row.is_base_unit,
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const unitOfMeasureService = new UnitOfMeasureService();
