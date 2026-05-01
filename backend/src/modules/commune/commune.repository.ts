import { prisma } from "../../config/database";

/**
 * Contract for creating a commune row in the database.
 */
export interface CreateCommuneInput {
  city_id: bigint;
  code: string;
  name: string;
  postal_code?: string;
}

/**
 * Contract for partial commune updates.
 * `code` and `city_id` are intentionally immutable.
 */
export interface UpdateCommuneInput {
  name?: string;
  postal_code?: string;
}

/**
 * Repository layer for direct persistence operations over `communes`.
 */
class CommuneRepository {
  /**
   * Retrieves all communes ordered by region, city and commune name.
   */
  findAll() {
    return prisma.communes.findMany({
      select: {
        id: true,
        city_id: true,
        code: true,
        name: true,
        postal_code: true,
        created_at: true,
        updated_at: true,
        cities: {
          select: {
            id: true,
            code: true,
            name: true,
            regions: {
              select: {
                id: true,
                country_code: true,
                code: true,
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            companies: true,
            customers: true,
            suppliers: true,
            warehouses: true
          }
        }
      },
      orderBy: [
        { cities: { regions: { country_code: "asc" } } },
        { cities: { regions: { name: "asc" } } },
        { cities: { name: "asc" } },
        { name: "asc" }
      ]
    });
  }

  /**
   * Finds a commune by id including full relations and usage counts.
   */
  findById(id: bigint) {
    return prisma.communes.findFirst({
      where: { id },
      include: {
        cities: {
          include: {
            regions: true
          }
        },
        _count: {
          select: {
            companies: true,
            customers: true,
            suppliers: true,
            warehouses: true
          }
        }
      }
    });
  }

  /**
   * Finds a commune by composite unique key (city_id + code).
   */
  findByCityAndCode(city_id: bigint, code: string) {
    return prisma.communes.findFirst({
      where: { city_id, code }
    });
  }

  /**
   * Checks if a city exists.
   */
  findCityById(id: bigint) {
    return prisma.cities.findFirst({ where: { id } });
  }

  /**
   * Persists a new commune.
   */
  create(data: CreateCommuneInput) {
    return prisma.communes.create({ data });
  }

  /**
   * Updates mutable fields on an existing commune.
   */
  update(id: bigint, data: UpdateCommuneInput) {
    return prisma.communes.update({ where: { id }, data });
  }

  /**
   * Hard-deletes a commune (no soft-delete on this table).
   */
  remove(id: bigint) {
    return prisma.communes.delete({ where: { id } });
  }
}

export const communeRepository = new CommuneRepository();
