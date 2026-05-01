import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { supplierRepository, CreateSupplierInput, UpdateSupplierInput } from "./supplier.repository";

/**
 * Business layer for supplier operations.
 */
class SupplierService {
  /**
   * Lists active suppliers for company scope.
   */
  async list(companyId: bigint) {
    const rows = await supplierRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one supplier by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const supplier = await supplierRepository.findById(companyId, id);
    if (!supplier) {
      throw new AppError("Proveedor no encontrado", 404);
    }
    return this.serialize(supplier);
  }

  /**
   * Creates one supplier in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreateSupplierInput, "company_id" | "commune_id"> & { commune_id?: number }) {
    const existing = await supplierRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de proveedor ya existe para la empresa", 409);
    }

    if (dto.tax_id) {
      const existingTax = await supplierRepository.findByTaxId(companyId, dto.tax_id);
      if (existingTax) {
        throw new AppError("El RUT/Tax ID ya existe para la empresa", 409);
      }
    }

    let communeId: bigint | undefined;
    if (dto.commune_id) {
      communeId = BigInt(dto.commune_id);
      const commune = await supplierRepository.findCommuneById(communeId);
      if (!commune) {
        throw new AppError("La comuna seleccionada no existe", 404);
      }
    }

    const created = await supplierRepository.create({
      company_id: companyId,
      code: dto.code,
      tax_id: dto.tax_id,
      legal_name: dto.legal_name,
      business_activity: dto.business_activity,
      email: dto.email,
      phone: dto.phone,
      address_line: dto.address_line,
      commune_id: communeId,
      payment_terms_days: dto.payment_terms_days,
      is_active: dto.is_active,
      created_by: dto.created_by
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one supplier in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: Omit<UpdateSupplierInput, "commune_id"> & { commune_id?: number }) {
    await this.getById(companyId, id);

    if (dto.tax_id) {
      const existingTax = await supplierRepository.findByTaxId(companyId, dto.tax_id, id);
      if (existingTax) {
        throw new AppError("El RUT/Tax ID ya existe para la empresa", 409);
      }
    }

    let communeId: bigint | undefined;
    if (dto.commune_id !== undefined) {
      if (dto.commune_id) {
        communeId = BigInt(dto.commune_id);
        const commune = await supplierRepository.findCommuneById(communeId);
        if (!commune) {
          throw new AppError("La comuna seleccionada no existe", 404);
        }
      } else {
        communeId = undefined;
      }
    }

    await supplierRepository.update(companyId, id, {
      tax_id: dto.tax_id,
      legal_name: dto.legal_name,
      business_activity: dto.business_activity,
      email: dto.email,
      phone: dto.phone,
      address_line: dto.address_line,
      commune_id: dto.commune_id !== undefined ? communeId : undefined,
      payment_terms_days: dto.payment_terms_days,
      is_active: dto.is_active
    });

    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one supplier if there are no linked operations.
   */
  async remove(companyId: bigint, id: bigint) {
    const supplier = await supplierRepository.findById(companyId, id);
    if (!supplier) {
      throw new AppError("Proveedor no encontrado", 404);
    }

    const dependencies =
      supplier._count.supplier_contacts +
      supplier._count.documents;

    if (dependencies > 0) {
      throw new AppError("No se puede eliminar el proveedor porque tiene contactos o documentos asociados", 409);
    }

    await supplierRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma supplier entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    const dependenciesCount =
      (c._count?.supplier_contacts ?? 0) +
      (c._count?.documents ?? 0);

    return {
      id: c.id.toString(),
      company_id: c.company_id.toString(),
      code: c.code,
      tax_id: c.tax_id ?? null,
      legal_name: c.legal_name,
      business_activity: c.business_activity ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      address_line: c.address_line ?? null,
      commune_id: c.commune_id?.toString() ?? null,
      commune_name: c.communes?.name ?? null,
      city_name: c.communes?.cities?.name ?? null,
      region_name: c.communes?.cities?.regions?.name ?? null,
      payment_terms_days: c.payment_terms_days,
      is_active: c.is_active,
      dependencies_count: dependenciesCount,
      created_at: toUtcIsoString(c.created_at),
      updated_at: toUtcIsoString(c.updated_at)
    };
  }
}

export const supplierService = new SupplierService();

