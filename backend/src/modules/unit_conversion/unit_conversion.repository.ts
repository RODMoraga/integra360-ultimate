import { prisma } from "../../config/database";

/**
 * Contract for creating a unit_conversions row.
 */
export interface CreateUnitConversionInput {
  company_id: bigint;
  from_unit_id: bigint;
  to_unit_id: bigint;
  factor: number;
}

/**
 * Contract for partial updates over unit conversions.
 */
export type UpdateUnitConversionInput = Partial<Omit<CreateUnitConversionInput, "company_id">>;

/**
 * Repository layer for direct persistence operations over `unit_conversions`.
 */
class UnitConversionRepository {
  /**
   * Retrieves all conversion rows for one company.
   */
  findAll(companyId: bigint) {
    return prisma.unit_conversions.findMany({
      where: { company_id: companyId },
      select: {
        id: true,
        company_id: true,
        from_unit_id: true,
        to_unit_id: true,
        factor: true,
        created_at: true,
        updated_at: true,
        units_of_measure_unit_conversions_from_unit_idTounits_of_measure: {
          select: {
            id: true,
            code: true,
            name: true,
            symbol: true,
            unit_type: true
          }
        },
        units_of_measure_unit_conversions_to_unit_idTounits_of_measure: {
          select: {
            id: true,
            code: true,
            name: true,
            symbol: true,
            unit_type: true
          }
        }
      },
      orderBy: { id: "desc" }
    });
  }

  /**
   * Finds one conversion row by id within company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.unit_conversions.findFirst({
      where: { id, company_id: companyId },
      select: {
        id: true,
        company_id: true,
        from_unit_id: true,
        to_unit_id: true,
        factor: true,
        created_at: true,
        updated_at: true,
        units_of_measure_unit_conversions_from_unit_idTounits_of_measure: {
          select: {
            id: true,
            code: true,
            name: true,
            symbol: true,
            unit_type: true
          }
        },
        units_of_measure_unit_conversions_to_unit_idTounits_of_measure: {
          select: {
            id: true,
            code: true,
            name: true,
            symbol: true,
            unit_type: true
          }
        }
      }
    });
  }

  /**
   * Finds a conversion by pair within company scope.
   */
  findByPair(companyId: bigint, fromUnitId: bigint, toUnitId: bigint, excludeId?: bigint) {
    return prisma.unit_conversions.findFirst({
      where: {
        company_id: companyId,
        from_unit_id: fromUnitId,
        to_unit_id: toUnitId,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Finds one active unit by id within company scope.
   */
  findUnitById(companyId: bigint, unitId: bigint) {
    return prisma.units_of_measure.findFirst({
      where: {
        id: unitId,
        company_id: companyId,
        deleted_at: null
      },
      select: {
        id: true,
        code: true,
        name: true,
        symbol: true,
        unit_type: true
      }
    });
  }

  /**
   * Inserts one conversion row.
   */
  create(data: CreateUnitConversionInput) {
    const now = new Date();
    return prisma.unit_conversions.create({
      data: {
        ...data,
        created_at: now,
        updated_at: now
      }
    });
  }

  /**
   * Updates one conversion row.
   */
  update(id: bigint, data: UpdateUnitConversionInput) {
    return prisma.unit_conversions.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date()
      }
    });
  }

  /**
   * Hard-deletes one conversion row.
   */
  remove(id: bigint) {
    return prisma.unit_conversions.delete({ where: { id } });
  }
}

export const unitConversionRepository = new UnitConversionRepository();
