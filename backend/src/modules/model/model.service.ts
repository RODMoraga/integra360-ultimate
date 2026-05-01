import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { modelRepository, CreateModelInput, UpdateModelInput } from "./model.repository";

/**
 * Business layer for model operations.
 */
class ModelService {
  /**
   * Lists active models for company scope.
   */
  async list(companyId: bigint) {
    const rows = await modelRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Lists active brands for company scope.
   */
  async listBrands(companyId: bigint) {
    const rows = await modelRepository.findBrands(companyId);
    return rows.map((row) => ({
      id: row.id.toString(),
      code: row.code,
      name: row.name
    }));
  }

  /**
   * Returns one model by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const model = await modelRepository.findById(companyId, id);
    if (!model) {
      throw new AppError("Modelo no encontrado", 404);
    }
    return this.serialize(model);
  }

  /**
   * Creates one model in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreateModelInput, "company_id" | "brand_id"> & { brand_id: number }) {
    const existing = await modelRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de modelo ya existe para la empresa", 409);
    }

    const brandId = BigInt(dto.brand_id);
    const brand = await modelRepository.findBrandById(companyId, brandId);
    if (!brand) {
      throw new AppError("La marca seleccionada no existe", 404);
    }

    const created = await modelRepository.create({
      company_id: companyId,
      brand_id: brandId,
      code: dto.code,
      name: dto.name
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one model in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: Omit<UpdateModelInput, "brand_id"> & { brand_id?: number }) {
    await this.getById(companyId, id);

    let brandId: bigint | undefined;
    if (dto.brand_id !== undefined) {
      brandId = BigInt(dto.brand_id);
      const brand = await modelRepository.findBrandById(companyId, brandId);
      if (!brand) {
        throw new AppError("La marca seleccionada no existe", 404);
      }
    }

    await modelRepository.update(companyId, id, {
      brand_id: brandId,
      name: dto.name
    });

    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one model if there are no linked products.
   */
  async remove(companyId: bigint, id: bigint) {
    const model = await modelRepository.findById(companyId, id);
    if (!model) {
      throw new AppError("Modelo no encontrado", 404);
    }

    const dependencies = model._count.products;

    if (dependencies > 0) {
      throw new AppError("No se puede eliminar el modelo porque tiene productos asociados", 409);
    }

    await modelRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma model entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(m: any) {
    return {
      id: m.id.toString(),
      company_id: m.company_id.toString(),
      brand_id: m.brand_id.toString(),
      brand_code: m.brands?.code ?? null,
      brand_name: m.brands?.name ?? null,
      code: m.code,
      name: m.name,
      dependencies_count: m._count?.products ?? 0,
      products_count: m._count?.products ?? 0,
      created_at: toUtcIsoString(m.created_at),
      updated_at: toUtcIsoString(m.updated_at)
    };
  }
}

export const modelService = new ModelService();