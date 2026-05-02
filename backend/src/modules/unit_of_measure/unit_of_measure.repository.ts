import { prisma } from "../../config/database";

/**
 * Contract for creating a units_of_measure row.
 */
export interface CreateUnitOfMeasureInput {
  company_id: bigint;
  code: string;
  name: string;
  symbol: string;
  unit_type: string;
  is_base_unit?: boolean;
}

/**
 * Contract for partial updates.
 * `code` is intentionally immutable.
 */
export type UpdateUnitOfMeasureInput = Partial<
  Omit<CreateUnitOfMeasureInput, "company_id" | "code">
>;

/**
 * Repository layer for direct persistence operations over `units_of_measure`.
 */
class UnitOfMeasureRepository {
  /**
   * Retrieves active units for one company.
   */
  findAll(companyId: bigint) {
    return prisma.units_of_measure.findMany({
      where: { company_id: companyId, deleted_at: null },
      orderBy: [{ unit_type: "asc" }, { name: "asc" }]
    });
  }

  /**
   * Finds one active unit by id within company scope.
   */
  findById(companyId: bigint, id: bigint) {
    return prisma.units_of_measure.findFirst({
      where: { id, company_id: companyId, deleted_at: null }
    });
  }

  /**
   * Finds an active unit by code within company scope.
   */
  findByCode(companyId: bigint, code: string) {
    return prisma.units_of_measure.findFirst({
      where: { company_id: companyId, code, deleted_at: null }
    });
  }

  /**
   * Finds the current base unit for a given type and company.
   * Optionally excludes one unit id from the search.
   */
  findBaseByType(companyId: bigint, unitType: string, excludeId?: bigint) {
    return prisma.units_of_measure.findFirst({
      where: {
        company_id: companyId,
        unit_type: unitType,
        is_base_unit: true,
        deleted_at: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      }
    });
  }

  /**
   * Re-bases one unit as the only base unit for a given type in the company.
   * It runs atomically to avoid inconsistent base flags.
   */
  async rebaseBaseUnit(companyId: bigint, unitType: string, baseUnitId: bigint) {
    const now = new Date();

    const txResult = await prisma.$transaction([
      prisma.units_of_measure.updateMany({
        where: {
          company_id: companyId,
          unit_type: unitType,
          is_base_unit: true,
          deleted_at: null,
          id: { not: baseUnitId }
        },
        data: { is_base_unit: false, updated_at: now }
      }),
      prisma.units_of_measure.update({
        where: { id: baseUnitId },
        data: { is_base_unit: true, updated_at: now }
      })
    ]);

    return txResult[1];
  }

  /**
   * Counts products that reference this unit to guard soft-delete.
   */
  countProducts(id: bigint) {
    return prisma.products.count({ where: { base_uom_id: id, deleted_at: null } });
  }

  /**
   * Inserts a new unit_of_measure row.
   */
  create(data: CreateUnitOfMeasureInput) {
    const now = new Date();
    return prisma.units_of_measure.create({
      data: { ...data, created_at: now, updated_at: now }
    });
  }

  /**
   * Updates a unit_of_measure row and refreshes `updated_at`.
   */
  update(id: bigint, data: UpdateUnitOfMeasureInput) {
    return prisma.units_of_measure.update({
      where: { id },
      data: { ...data, updated_at: new Date() }
    });
  }

  /**
   * Soft-deletes a unit_of_measure row.
   */
  softDelete(id: bigint) {
    return prisma.units_of_measure.update({
      where: { id },
      data: { deleted_at: new Date() }
    });
  }
}

export const unitOfMeasureRepository = new UnitOfMeasureRepository();
