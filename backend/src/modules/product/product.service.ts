import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { productRepository, CreateProductInput, UpdateProductInput } from "./product.repository";

/**
 * Business layer for product operations.
 */
class ProductService {
  /**
   * Lists active products for company scope.
   */
  async list(companyId: bigint) {
    const rows = await productRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Lists active units of measure for company scope.
   */
  async listUnits(companyId: bigint) {
    const rows = await productRepository.findUnits(companyId);
    return rows.map((row) => ({
      id: row.id.toString(),
      code: row.code,
      name: row.name,
      symbol: row.symbol
    }));
  }

  /**
   * Returns one product by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const product = await productRepository.findById(companyId, id);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }
    return this.serialize(product);
  }

  /**
   * Creates one product in company scope.
   */
  async create(companyId: bigint, dto: CreateProductDto) {
    const existing = await productRepository.findBySku(companyId, dto.sku);
    if (existing) {
      throw new AppError("El SKU ya existe para la empresa", 409);
    }

    if (dto.barcode) {
      const bcExists = await productRepository.findByBarcode(companyId, dto.barcode);
      if (bcExists) {
        throw new AppError("El código de barras ya existe para la empresa", 409);
      }
    }

    const uomId = BigInt(dto.base_uom_id);
    const uom = await productRepository.findUomById(companyId, uomId);
    if (!uom) {
      throw new AppError("La unidad de medida seleccionada no existe", 404);
    }

    const created = await productRepository.create({
      company_id: companyId,
      sku: dto.sku,
      barcode: dto.barcode ?? null,
      name: dto.name,
      description: dto.description ?? null,
      category_id: dto.category_id ? BigInt(dto.category_id) : null,
      subcategory_id: dto.subcategory_id ? BigInt(dto.subcategory_id) : null,
      brand_id: dto.brand_id ? BigInt(dto.brand_id) : null,
      model_id: dto.model_id ? BigInt(dto.model_id) : null,
      base_uom_id: uomId,
      tax_rate: dto.tax_rate ?? 0,
      cost_price: dto.cost_price ?? 0,
      sale_price: dto.sale_price ?? 0,
      min_price: dto.min_price ?? null,
      is_featured: dto.is_featured ?? false,
      track_inventory: dto.track_inventory ?? true,
      min_stock: dto.min_stock ?? 0,
      is_service: dto.is_service ?? false,
      is_active: dto.is_active ?? true
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one product in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateProductDto) {
    await this.getById(companyId, id);

    if (dto.barcode !== undefined && dto.barcode !== null) {
      const bcExists = await productRepository.findByBarcode(companyId, dto.barcode, id);
      if (bcExists) {
        throw new AppError("El código de barras ya existe para la empresa", 409);
      }
    }

    if (dto.base_uom_id !== undefined) {
      const uomId = BigInt(dto.base_uom_id);
      const uom = await productRepository.findUomById(companyId, uomId);
      if (!uom) {
        throw new AppError("La unidad de medida seleccionada no existe", 404);
      }
    }

    const updateData: UpdateProductInput = {
      ...(dto.barcode !== undefined && { barcode: dto.barcode }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.category_id !== undefined && { category_id: dto.category_id ? BigInt(dto.category_id) : null }),
      ...(dto.subcategory_id !== undefined && { subcategory_id: dto.subcategory_id ? BigInt(dto.subcategory_id) : null }),
      ...(dto.brand_id !== undefined && { brand_id: dto.brand_id ? BigInt(dto.brand_id) : null }),
      ...(dto.model_id !== undefined && { model_id: dto.model_id ? BigInt(dto.model_id) : null }),
      ...(dto.base_uom_id !== undefined && { base_uom_id: BigInt(dto.base_uom_id) }),
      ...(dto.tax_rate !== undefined && { tax_rate: dto.tax_rate }),
      ...(dto.cost_price !== undefined && { cost_price: dto.cost_price }),
      ...(dto.sale_price !== undefined && { sale_price: dto.sale_price }),
      ...(dto.min_price !== undefined && { min_price: dto.min_price }),
      ...(dto.is_featured !== undefined && { is_featured: dto.is_featured }),
      ...(dto.track_inventory !== undefined && { track_inventory: dto.track_inventory }),
      ...(dto.min_stock !== undefined && { min_stock: dto.min_stock }),
      ...(dto.is_service !== undefined && { is_service: dto.is_service }),
      ...(dto.is_active !== undefined && { is_active: dto.is_active })
    };

    await productRepository.update(companyId, id, updateData);
    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one product.
   */
  async remove(companyId: bigint, id: bigint) {
    const product = await productRepository.findById(companyId, id);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }
    await productRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma product entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(p: any) {
    return {
      id: p.id.toString(),
      company_id: p.company_id.toString(),
      sku: p.sku,
      barcode: p.barcode ?? null,
      name: p.name,
      description: p.description ?? null,
      category_id: p.category_id?.toString() ?? null,
      category_name: p.categories?.name ?? null,
      category_code: p.categories?.code ?? null,
      subcategory_id: p.subcategory_id?.toString() ?? null,
      subcategory_name: p.subcategories?.name ?? null,
      brand_id: p.brand_id?.toString() ?? null,
      brand_name: p.brands?.name ?? null,
      brand_code: p.brands?.code ?? null,
      model_id: p.model_id?.toString() ?? null,
      model_name: p.models?.name ?? null,
      base_uom_id: p.base_uom_id.toString(),
      uom_code: p.units_of_measure?.code ?? null,
      uom_name: p.units_of_measure?.name ?? null,
      uom_symbol: p.units_of_measure?.symbol ?? null,
      tax_rate: Number(p.tax_rate),
      cost_price: Number(p.cost_price),
      sale_price: Number(p.sale_price),
      min_price: p.min_price != null ? Number(p.min_price) : null,
      is_featured: p.is_featured,
      track_inventory: p.track_inventory,
      min_stock: Number(p.min_stock),
      is_service: p.is_service,
      is_active: p.is_active,
      created_at: toUtcIsoString(p.created_at),
      updated_at: toUtcIsoString(p.updated_at)
    };
  }
}

export const productService = new ProductService();

// Local types used in service
type CreateProductDto = {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  brand_id?: number | null;
  model_id?: number | null;
  base_uom_id: number;
  tax_rate?: number;
  cost_price?: number;
  sale_price?: number;
  min_price?: number | null;
  is_featured?: boolean;
  track_inventory?: boolean;
  min_stock?: number;
  is_service?: boolean;
  is_active?: boolean;
};

type UpdateProductDto = Partial<Omit<CreateProductDto, "sku">>;
