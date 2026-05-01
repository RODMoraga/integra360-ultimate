import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { communeRepository, CreateCommuneInput, UpdateCommuneInput } from "./commune.repository";

/**
 * Business layer for commune operations.
 */
class CommuneService {
  /**
   * Lists all communes and serializes database types for API responses.
   */
  async list() {
    const rows = await communeRepository.findAll();
    return rows.map(this.serialize);
  }

  /**
   * Returns one commune by id.
   * @throws AppError when the record does not exist.
   */
  async getById(id: bigint) {
    const commune = await communeRepository.findById(id);
    if (!commune) throw new AppError("Comuna no encontrada", 404);
    return this.serialize(commune);
  }

  /**
   * Creates a new commune after validating city and unique constraints.
   * @throws AppError when city does not exist or city_id + code already exists.
   */
  async create(dto: CreateCommuneInput) {
    const city = await communeRepository.findCityById(dto.city_id);
    if (!city) throw new AppError("La ciudad seleccionada no existe", 404);

    const existing = await communeRepository.findByCityAndCode(dto.city_id, dto.code);
    if (existing) {
      throw new AppError(
        `Ya existe una comuna con código "${dto.code}" en la ciudad seleccionada`,
        409
      );
    }

    const commune = await communeRepository.create(dto);
    return this.getById(commune.id);
  }

  /**
   * Updates mutable fields of an existing commune.
   * @throws AppError when the commune does not exist.
   */
  async update(id: bigint, dto: UpdateCommuneInput) {
    await this.getById(id);
    await communeRepository.update(id, dto);
    return this.getById(id);
  }

  /**
   * Hard-deletes a commune.
   * @throws AppError when the commune does not exist or has dependent records.
   */
  async remove(id: bigint) {
    const commune = await communeRepository.findById(id);
    if (!commune) throw new AppError("Comuna no encontrada", 404);

    const dependencies =
      commune._count.companies +
      commune._count.customers +
      commune._count.suppliers +
      commune._count.warehouses;

    if (dependencies > 0) {
      throw new AppError(
        "No se puede eliminar la comuna porque tiene registros asociados (empresas, clientes, proveedores o bodegas).",
        409
      );
    }

    await communeRepository.remove(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    return {
      id: c.id.toString(),
      city_id: c.city_id.toString(),
      city_code: c.cities?.code ?? null,
      city_name: c.cities?.name ?? null,
      region_id: c.cities?.regions?.id?.toString() ?? null,
      region_country_code: c.cities?.regions?.country_code ?? null,
      region_code: c.cities?.regions?.code ?? null,
      region_name: c.cities?.regions?.name ?? null,
      code: c.code,
      name: c.name,
      postal_code: c.postal_code ?? null,
      companies_count: c._count?.companies ?? 0,
      customers_count: c._count?.customers ?? 0,
      suppliers_count: c._count?.suppliers ?? 0,
      warehouses_count: c._count?.warehouses ?? 0,
      dependencies_count:
        (c._count?.companies ?? 0) +
        (c._count?.customers ?? 0) +
        (c._count?.suppliers ?? 0) +
        (c._count?.warehouses ?? 0),
      created_at: toUtcIsoString(c.created_at),
      updated_at: toUtcIsoString(c.updated_at)
    };
  }
}

export const communeService = new CommuneService();
