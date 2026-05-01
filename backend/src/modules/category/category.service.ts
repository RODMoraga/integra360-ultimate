import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { categoryRepository, CreateCategoryInput, UpdateCategoryInput } from "./category.repository";

/**
 * Business layer for category operations.
 */
class CategoryService {
  /**
   * Lists active categories for company scope.
   */
  async list(companyId: bigint) {
    const rows = await categoryRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one category by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const category = await categoryRepository.findById(companyId, id);
    if (!category) {
      throw new AppError("Categoría no encontrada", 404);
    }
    return this.serialize(category);
  }

  /**
   * Creates one category in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreateCategoryInput, "company_id">) {
    const existing = await categoryRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de categoría ya existe para la empresa", 409);
    }

    const created = await categoryRepository.create({
      company_id: companyId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      is_active: dto.is_active
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one category in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateCategoryInput) {
    await this.getById(companyId, id);

    await categoryRepository.update(companyId, id, {
      name: dto.name,
      description: dto.description,
      is_active: dto.is_active
    });

    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one category if there are no linked operations.
   */
  async remove(companyId: bigint, id: bigint) {
    const category = await categoryRepository.findById(companyId, id);
    if (!category) {
      throw new AppError("Categoría no encontrada", 404);
    }

    const dependencies =
      category._count.products +
      category._count.subcategories;

    if (dependencies > 0) {
      throw new AppError("No se puede eliminar la categoría porque tiene subcategorías o productos asociados", 409);
    }

    await categoryRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma category entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    const dependenciesCount =
      (c._count?.products ?? 0) +
      (c._count?.subcategories ?? 0);

    return {
      id: c.id.toString(),
      company_id: c.company_id.toString(),
      code: c.code,
      name: c.name,
      description: c.description ?? null,
      is_active: c.is_active,
      dependencies_count: dependenciesCount,
      products_count: c._count?.products ?? 0,
      subcategories_count: c._count?.subcategories ?? 0,
      created_at: toUtcIsoString(c.created_at),
      updated_at: toUtcIsoString(c.updated_at)
    };
  }
}

export const categoryService = new CategoryService();