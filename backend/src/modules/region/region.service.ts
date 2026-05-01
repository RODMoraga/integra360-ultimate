import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { regionRepository, CreateRegionInput, UpdateRegionInput } from "./region.repository";

/**
 * Business layer for region operations.
 */
class RegionService {
  /**
   * Lists all regions and serializes database types for API responses.
   */
  async list() {
    const rows = await regionRepository.findAll();
    return rows.map(this.serialize);
  }

  /**
   * Returns one region by id.
   * @throws AppError when the record does not exist.
   */
  async getById(id: bigint) {
    const region = await regionRepository.findById(id);
    if (!region) throw new AppError("Región no encontrada", 404);
    return this.serialize(region);
  }

  /**
   * Creates a new region after validating composite unique constraint.
   * @throws AppError when country_code + code combination already exists.
   */
  async create(dto: CreateRegionInput) {
    const existing = await regionRepository.findByCountryAndCode(dto.country_code, dto.code);
    if (existing) {
      throw new AppError(
        `Ya existe una región con código "${dto.code}" para el país "${dto.country_code}"`,
        409
      );
    }

    const region = await regionRepository.create(dto);
    // create does not include _count, fetch full record
    return this.getById(region.id);
  }

  /**
   * Updates the name of an existing region.
   * @throws AppError when the region does not exist.
   */
  async update(id: bigint, dto: UpdateRegionInput) {
    await this.getById(id);
    await regionRepository.update(id, dto);
    return this.getById(id);
  }

  /**
   * Hard-deletes a region.
   * @throws AppError when the region does not exist or has associated cities.
   */
  async remove(id: bigint) {
    const region = await regionRepository.findById(id);
    if (!region) throw new AppError("Región no encontrada", 404);

    if (region._count.cities > 0) {
      throw new AppError(
        `No se puede eliminar la región porque tiene ${region._count.cities} ciudad(es) asociada(s).`,
        409
      );
    }

    await regionRepository.remove(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(r: any) {
    return {
      id: r.id.toString(),
      country_code: r.country_code,
      code: r.code,
      name: r.name,
      cities_count: r._count?.cities ?? 0,
      created_at: toUtcIsoString(r.created_at),
      updated_at: toUtcIsoString(r.updated_at)
    };
  }
}

export const regionService = new RegionService();
