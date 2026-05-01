import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { subcategoryRepository, CreateSubcategoryInput, UpdateSubcategoryInput } from "./subcategory.repository";

/**
 * Business layer for subcategory operations.
 */
class SubcategoryService {
  /**
   * Lists active subcategories for company scope.
   */
  async list(companyId: bigint) {
    const rows = await subcategoryRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one subcategory by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const subcategory = await subcategoryRepository.findById(companyId, id);
    if (!subcategory) {
      throw new AppError("Subcategoría no encontrada", 404);
    }
    return this.serialize(subcategory);
  }

  /**
   * Creates one subcategory in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreateSubcategoryInput, "company_id" | "category_id"> & { category_id: number }) {
    const existing = await subcategoryRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de subcategoría ya existe para la empresa", 409);
    }

    const categoryId = BigInt(dto.category_id);
    const category = await subcategoryRepository.findCategoryById(companyId, categoryId);
    if (!category) {
      throw new AppError("La categoría seleccionada no existe", 404);
    }

    const created = await subcategoryRepository.create({
      company_id: companyId,
      category_id: categoryId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      is_active: dto.is_active
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one subcategory in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: Omit<UpdateSubcategoryInput, "category_id"> & { category_id?: number }) {
    await this.getById(companyId, id);

    let categoryId: bigint | undefined;
    if (dto.category_id !== undefined) {
      categoryId = BigInt(dto.category_id);
      const category = await subcategoryRepository.findCategoryById(companyId, categoryId);
      if (!category) {
        throw new AppError("La categoría seleccionada no existe", 404);
      }
    }

    await subcategoryRepository.update(companyId, id, {
      category_id: categoryId,
      name: dto.name,
      description: dto.description,
      is_active: dto.is_active
    });

    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one subcategory if there are no linked products.
   */
  async remove(companyId: bigint, id: bigint) {
    const subcategory = await subcategoryRepository.findById(companyId, id);
    if (!subcategory) {
      throw new AppError("Subcategoría no encontrada", 404);
    }

    const dependencies = subcategory._count.products;

    if (dependencies > 0) {
      throw new AppError("No se puede eliminar la subcategoría porque tiene productos asociados", 409);
    }

    await subcategoryRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma subcategory entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    return {
      id: c.id.toString(),
      company_id: c.company_id.toString(),
      category_id: c.category_id.toString(),
      category_code: c.categories?.code ?? null,
      category_name: c.categories?.name ?? null,
      code: c.code,
      name: c.name,
      description: c.description ?? null,
      is_active: c.is_active,
      dependencies_count: c._count?.products ?? 0,
      products_count: c._count?.products ?? 0,
      created_at: toUtcIsoString(c.created_at),
      updated_at: toUtcIsoString(c.updated_at)
    };
  }
}

export const subcategoryService = new SubcategoryService();