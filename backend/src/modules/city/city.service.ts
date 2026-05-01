import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { cityRepository, CreateCityInput, UpdateCityInput } from "./city.repository";

/**
 * Business layer for city operations.
 */
class CityService {
  /**
   * Lists all cities and serializes database types for API responses.
   */
  async list() {
    const rows = await cityRepository.findAll();
    return rows.map(this.serialize);
  }

  /**
   * Returns one city by id.
   * @throws AppError when the record does not exist.
   */
  async getById(id: bigint) {
    const city = await cityRepository.findById(id);
    if (!city) throw new AppError("Ciudad no encontrada", 404);
    return this.serialize(city);
  }

  /**
   * Creates a new city after validating region and unique constraints.
   * @throws AppError when region does not exist or region_id + code already exists.
   */
  async create(dto: CreateCityInput) {
    const region = await cityRepository.findRegionById(dto.region_id);
    if (!region) throw new AppError("La región seleccionada no existe", 404);

    const existing = await cityRepository.findByRegionAndCode(dto.region_id, dto.code);
    if (existing) {
      throw new AppError(
        `Ya existe una ciudad con código "${dto.code}" en la región seleccionada`,
        409
      );
    }

    const city = await cityRepository.create(dto);
    return this.getById(city.id);
  }

  /**
   * Updates the name of an existing city.
   * @throws AppError when the city does not exist.
   */
  async update(id: bigint, dto: UpdateCityInput) {
    await this.getById(id);
    await cityRepository.update(id, dto);
    return this.getById(id);
  }

  /**
   * Hard-deletes a city.
   * @throws AppError when the city does not exist or has associated communes.
   */
  async remove(id: bigint) {
    const city = await cityRepository.findById(id);
    if (!city) throw new AppError("Ciudad no encontrada", 404);

    if (city._count.communes > 0) {
      throw new AppError(
        `No se puede eliminar la ciudad porque tiene ${city._count.communes} comuna(s) asociada(s).`,
        409
      );
    }

    await cityRepository.remove(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    return {
      id: c.id.toString(),
      region_id: c.region_id.toString(),
      region_country_code: c.regions?.country_code ?? null,
      region_code: c.regions?.code ?? null,
      region_name: c.regions?.name ?? null,
      code: c.code,
      name: c.name,
      communes_count: c._count?.communes ?? 0,
      created_at: toUtcIsoString(c.created_at),
      updated_at: toUtcIsoString(c.updated_at)
    };
  }
}

export const cityService = new CityService();
