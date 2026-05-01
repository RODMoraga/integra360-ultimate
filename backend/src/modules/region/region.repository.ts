import { prisma } from "../../config/database";

/**
 * Contract for creating a region row in the database.
 */
export interface CreateRegionInput {
  country_code: string;
  code: string;
  name: string;
}

/**
 * Contract for partial region updates.
 * `code` and `country_code` are intentionally immutable.
 */
export interface UpdateRegionInput {
  name?: string;
}

/**
 * Repository layer for direct persistence operations over `regions`.
 */
class RegionRepository {
  /**
   * Retrieves all regions ordered by country_code, name, including city count.
   */
  findAll() {
    return prisma.regions.findMany({
      select: {
        id: true,
        country_code: true,
        code: true,
        name: true,
        created_at: true,
        updated_at: true,
        _count: { select: { cities: true } }
      },
      orderBy: [{ country_code: "asc" }, { name: "asc" }]
    });
  }

  /**
   * Finds a region by primary key, including full city count.
   */
  findById(id: bigint) {
    return prisma.regions.findFirst({
      where: { id },
      include: {
        _count: { select: { cities: true } }
      }
    });
  }

  /**
   * Finds a region by composite unique key (country_code + code).
   */
  findByCountryAndCode(country_code: string, code: string) {
    return prisma.regions.findFirst({
      where: { country_code, code }
    });
  }

  /**
   * Persists a new region.
   */
  create(data: CreateRegionInput) {
    return prisma.regions.create({ data });
  }

  /**
   * Updates mutable fields on an existing region.
   */
  update(id: bigint, data: UpdateRegionInput) {
    return prisma.regions.update({ where: { id }, data });
  }

  /**
   * Hard-deletes a region (no soft-delete on this table).
   */
  remove(id: bigint) {
    return prisma.regions.delete({ where: { id } });
  }
}

export const regionRepository = new RegionRepository();
