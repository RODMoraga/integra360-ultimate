import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { logger } from "../../config/logger";
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
   * @throws AppError (409) when another active base unit exists for the same type.
   */
  async create(
    companyId: bigint,
    dto: Omit<CreateUnitOfMeasureInput, "company_id">
  ) {
    const existing = await unitOfMeasureRepository.findByCode(companyId, dto.code);
    if (existing) throw new AppError("El código de unidad ya existe para esta empresa", 409);

    if (dto.is_base_unit) {
      const existingBase = await unitOfMeasureRepository.findBaseByType(companyId, dto.unit_type);
      if (existingBase) {
        logger.warn(
          { companyId: companyId.toString(), unit_type: dto.unit_type, conflictId: existingBase.id.toString() },
          "create: is_base_unit conflict rejected (409)"
        );
        throw new AppError(
          `Ya existe una unidad base para el tipo "${dto.unit_type}": ${existingBase.name} (${existingBase.code}). Desmarque esa unidad base antes de asignar otra.`,
          409
        );
      }
    }

    const data: CreateUnitOfMeasureInput = { ...dto, company_id: companyId };
    try {
      const row = await unitOfMeasureRepository.create(data);
      logger.info({ id: row.id.toString(), is_base_unit: dto.is_base_unit }, "UnitOfMeasure created");
      return this.serialize(row);
    } catch (err) {
      if ((err as { code?: string })?.code === "P2002") {
        logger.error({ companyId: companyId.toString(), unit_type: dto.unit_type }, "create: DB unique constraint violation on is_base_unit");
        throw new AppError(
          `Ya existe una unidad base activa para el tipo "${dto.unit_type}". Desmarque esa unidad base antes de asignar otra.`,
          409
        );
      }
      throw err;
    }
  }

  /**
   * Updates an existing unit of measure.
   * @throws AppError when the record does not exist.
   * @throws AppError (409) when another active base unit exists for the same type.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateUnitOfMeasureInput) {
    const existing = await unitOfMeasureRepository.findById(companyId, id);
    if (!existing) throw new AppError("Unidad de medida no encontrada", 404);

    const targetUnitType = dto.unit_type ?? existing.unit_type;
    const targetIsBase = dto.is_base_unit ?? existing.is_base_unit;

    if (targetIsBase) {
      const existingBase = await unitOfMeasureRepository.findBaseByType(companyId, targetUnitType, id);
      if (existingBase) {
        logger.warn(
          { companyId: companyId.toString(), id: id.toString(), unit_type: targetUnitType, conflictId: existingBase.id.toString() },
          "update: is_base_unit conflict rejected (409)"
        );
        throw new AppError(
          `Ya existe una unidad base para el tipo "${targetUnitType}": ${existingBase.name} (${existingBase.code}). Desmarque esa unidad base antes de asignar otra.`,
          409
        );
      }
    }

    try {
      const updated = await unitOfMeasureRepository.update(id, dto);
      logger.info(
        { id: id.toString(), is_base_unit: updated.is_base_unit, changed_fields: Object.keys(dto) },
        "UnitOfMeasure updated"
      );
      return this.serialize(updated);
    } catch (err) {
      if ((err as { code?: string })?.code === "P2002") {
        logger.error({ companyId: companyId.toString(), id: id.toString(), unit_type: targetUnitType }, "update: DB unique constraint violation on is_base_unit");
        throw new AppError(
          `Ya existe una unidad base activa para el tipo "${targetUnitType}". Desmarque esa unidad base antes de asignar otra.`,
          409
        );
      }
      throw err;
    }
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
