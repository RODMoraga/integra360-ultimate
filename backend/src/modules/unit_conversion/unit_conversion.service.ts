import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  unitConversionRepository,
  CreateUnitConversionInput,
  UpdateUnitConversionInput
} from "./unit_conversion.repository";

/**
 * Business layer for unit_conversions operations.
 */
class UnitConversionService {
  /**
   * Lists conversion rows for one company.
   */
  async list(companyId: bigint) {
    const rows = await unitConversionRepository.findAll(companyId);
    return rows.map(this.serialize);
  }

  /**
   * Returns one conversion by id.
   * @throws AppError when the row does not exist.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await unitConversionRepository.findById(companyId, id);
    if (!row) throw new AppError("Conversión de unidad no encontrada", 404);
    return this.serialize(row);
  }

  /**
   * Creates a conversion row after business validations.
   */
  async create(
    companyId: bigint,
    dto: Omit<CreateUnitConversionInput, "company_id" | "from_unit_id" | "to_unit_id"> & {
      from_unit_id: number;
      to_unit_id: number;
    }
  ) {
    const fromUnitId = BigInt(dto.from_unit_id);
    const toUnitId = BigInt(dto.to_unit_id);

    await this.assertValidUnits(companyId, fromUnitId, toUnitId);

    const existing = await unitConversionRepository.findByPair(companyId, fromUnitId, toUnitId);
    if (existing) {
      throw new AppError("Ya existe una conversión para este par de unidades", 409);
    }

    const data: CreateUnitConversionInput = {
      company_id: companyId,
      from_unit_id: fromUnitId,
      to_unit_id: toUnitId,
      factor: dto.factor
    };

    await unitConversionRepository.create(data);
    return this.getByPair(companyId, fromUnitId, toUnitId);
  }

  /**
   * Updates an existing conversion row.
   */
  async update(
    companyId: bigint,
    id: bigint,
    dto: Omit<UpdateUnitConversionInput, "from_unit_id" | "to_unit_id"> & {
      from_unit_id?: number;
      to_unit_id?: number;
    }
  ) {
    const existing = await unitConversionRepository.findById(companyId, id);
    if (!existing) throw new AppError("Conversión de unidad no encontrada", 404);

    const targetFrom = BigInt(dto.from_unit_id ?? Number(existing.from_unit_id));
    const targetTo = BigInt(dto.to_unit_id ?? Number(existing.to_unit_id));

    await this.assertValidUnits(companyId, targetFrom, targetTo);

    const duplicated = await unitConversionRepository.findByPair(companyId, targetFrom, targetTo, id);
    if (duplicated) {
      throw new AppError("Ya existe una conversión para este par de unidades", 409);
    }

    const data: UpdateUnitConversionInput = {
      from_unit_id: targetFrom,
      to_unit_id: targetTo,
      factor: dto.factor
    };

    await unitConversionRepository.update(id, data);
    const row = await unitConversionRepository.findById(companyId, id);
    if (!row) throw new AppError("Conversión de unidad no encontrada", 404);
    return this.serialize(row);
  }

  /**
   * Removes one conversion row.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await unitConversionRepository.remove(id);
  }

  /**
   * Ensures both units exist, are active and belong to same type.
   */
  private async assertValidUnits(companyId: bigint, fromUnitId: bigint, toUnitId: bigint) {
    if (fromUnitId === toUnitId) {
      throw new AppError("La unidad origen y destino deben ser distintas", 400);
    }

    const [fromUnit, toUnit] = await Promise.all([
      unitConversionRepository.findUnitById(companyId, fromUnitId),
      unitConversionRepository.findUnitById(companyId, toUnitId)
    ]);

    if (!fromUnit) throw new AppError("La unidad origen no existe o está inactiva", 404);
    if (!toUnit) throw new AppError("La unidad destino no existe o está inactiva", 404);

    if (fromUnit.unit_type !== toUnit.unit_type) {
      throw new AppError("Solo se permiten conversiones entre unidades del mismo tipo", 409);
    }
  }

  /**
   * Returns one row by unique pair and serializes it.
   */
  private async getByPair(companyId: bigint, fromUnitId: bigint, toUnitId: bigint) {
    const row = await unitConversionRepository.findByPair(companyId, fromUnitId, toUnitId);
    if (!row) throw new AppError("Conversión de unidad no encontrada", 404);
    const hydrated = await unitConversionRepository.findById(companyId, row.id);
    if (!hydrated) throw new AppError("Conversión de unidad no encontrada", 404);
    return this.serialize(hydrated);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(row: any) {
    const fromUnit = row.units_of_measure_unit_conversions_from_unit_idTounits_of_measure;
    const toUnit = row.units_of_measure_unit_conversions_to_unit_idTounits_of_measure;

    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      from_unit_id: row.from_unit_id.toString(),
      to_unit_id: row.to_unit_id.toString(),
      factor: row.factor?.toString?.() ?? String(row.factor),
      from_unit: fromUnit
        ? {
          id: fromUnit.id.toString(),
          code: fromUnit.code,
          name: fromUnit.name,
          symbol: fromUnit.symbol,
          unit_type: fromUnit.unit_type
        }
        : null,
      to_unit: toUnit
        ? {
          id: toUnit.id.toString(),
          code: toUnit.code,
          name: toUnit.name,
          symbol: toUnit.symbol,
          unit_type: toUnit.unit_type
        }
        : null,
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }
}

export const unitConversionService = new UnitConversionService();
