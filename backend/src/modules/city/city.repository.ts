import { prisma } from "../../config/database";

/**
 * Contract for creating a city row in the database.
 */
export interface CreateCityInput {
  region_id: bigint;
  code: string;
  name: string;
}

/**
 * Contract for partial city updates.
 * `code` and `region_id` are intentionally immutable.
 */
export interface UpdateCityInput {
  name?: string;
}

/**
 * Repository layer for direct persistence operations over `cities`.
 */
class CityRepository {
  /**
   * Retrieves all cities ordered by region and city name, including commune count.
   */
  findAll() {
    return prisma.cities.findMany({
      select: {
        id: true,
        region_id: true,
        code: true,
        name: true,
        created_at: true,
        updated_at: true,
        regions: {
          select: {
            id: true,
            country_code: true,
            code: true,
            name: true
          }
        },
        _count: { select: { communes: true } }
      },
      orderBy: [{ regions: { country_code: "asc" } }, { regions: { name: "asc" } }, { name: "asc" }]
    });
  }

  /**
   * Finds a city by primary key, including region relation and commune count.
   */
  findById(id: bigint) {
    return prisma.cities.findFirst({
      where: { id },
      include: {
        regions: true,
        _count: { select: { communes: true } }
      }
    });
  }

  /**
   * Finds a city by composite unique key (region_id + code).
   */
  findByRegionAndCode(region_id: bigint, code: string) {
    return prisma.cities.findFirst({
      where: { region_id, code }
    });
  }

  /**
   * Checks if a region exists.
   */
  findRegionById(id: bigint) {
    return prisma.regions.findFirst({ where: { id } });
  }

  /**
   * Persists a new city.
   */
  create(data: CreateCityInput) {
    return prisma.cities.create({ data });
  }

  /**
   * Updates mutable fields on an existing city.
   */
  update(id: bigint, data: UpdateCityInput) {
    return prisma.cities.update({ where: { id }, data });
  }

  /**
   * Hard-deletes a city (no soft-delete on this table).
   */
  remove(id: bigint) {
    return prisma.cities.delete({ where: { id } });
  }
}

export const cityRepository = new CityRepository();
