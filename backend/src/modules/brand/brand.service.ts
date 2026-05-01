import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { brandRepository, CreateBrandInput, UpdateBrandInput } from "./brand.repository";

/**
 * Business layer for brand operations.
 */
class BrandService {
  /**
   * Lists active brands for company scope.
   */
  async list(companyId: bigint) {
    const rows = await brandRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one brand by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const brand = await brandRepository.findById(companyId, id);
    if (!brand) {
      throw new AppError("Marca no encontrada", 404);
    }
    return this.serialize(brand);
  }

  /**
   * Creates one brand in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreateBrandInput, "company_id">) {
    const existing = await brandRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de marca ya existe para la empresa", 409);
    }

    const created = await brandRepository.create({
      company_id: companyId,
      code: dto.code,
      name: dto.name
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one brand in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateBrandInput) {
    await this.getById(companyId, id);
    await brandRepository.update(companyId, id, { name: dto.name });
    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one brand if there are no linked models or products.
   */
  async remove(companyId: bigint, id: bigint) {
    const brand = await brandRepository.findById(companyId, id);
    if (!brand) {
      throw new AppError("Marca no encontrada", 404);
    }

    const dependencies = (brand._count?.models ?? 0) + (brand._count?.products ?? 0);

    if (dependencies > 0) {
      throw new AppError(
        "No se puede eliminar la marca porque tiene modelos o productos asociados",
        409
      );
    }

    await brandRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma brand entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(b: any) {
    const modelsCount = b._count?.models ?? 0;
    const productsCount = b._count?.products ?? 0;
    return {
      id: b.id.toString(),
      company_id: b.company_id.toString(),
      code: b.code,
      name: b.name,
      models_count: modelsCount,
      products_count: productsCount,
      dependencies_count: modelsCount + productsCount,
      created_at: toUtcIsoString(b.created_at),
      updated_at: toUtcIsoString(b.updated_at)
    };
  }
}

export const brandService = new BrandService();
