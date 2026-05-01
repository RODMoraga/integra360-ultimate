import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  supplierContactRepository,
  CreateSupplierContactInput,
  UpdateSupplierContactInput
} from "./supplier_contact.repository";

/**
 * Business layer for supplier contact operations.
 */
class SupplierContactService {
  /**
   * Lists active contacts for the given company.
   */
  async list(companyId: bigint) {
    const rows = await supplierContactRepository.findAll(companyId);
    return rows.map(this.serialize);
  }

  /**
   * Returns one contact by id within company scope.
   * @throws AppError when the record does not exist.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await supplierContactRepository.findById(companyId, id);
    if (!row) throw new AppError("Contacto de proveedor no encontrado", 404);
    return this.serialize(row);
  }

  /**
   * Creates a new supplier contact.
   */
  async create(
    companyId: bigint,
    dto: Omit<CreateSupplierContactInput, "company_id" | "supplier_id"> & { supplier_id: number }
  ) {
    const data: CreateSupplierContactInput = {
      ...dto,
      company_id: companyId,
      supplier_id: BigInt(dto.supplier_id)
    };

    const row = await supplierContactRepository.create(data);
    return this.serialize(row);
  }

  /**
   * Updates an existing contact.
   * @throws AppError when the record does not exist.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateSupplierContactInput) {
    await this.getById(companyId, id);
    const updated = await supplierContactRepository.update(id, dto);
    return this.serialize(updated);
  }

  /**
   * Soft-deletes a contact.
   * @throws AppError when the record does not exist.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await supplierContactRepository.softDelete(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    return {
      id: c.id.toString(),
      company_id: c.company_id.toString(),
      supplier_id: c.supplier_id.toString(),
      supplier_legal_name: c.suppliers?.legal_name ?? null,
      supplier_code: c.suppliers?.code ?? null,
      full_name: c.full_name,
      email: c.email ?? null,
      phone: c.phone ?? null,
      role_name: c.role_name ?? null,
      is_primary: c.is_primary,
      created_at: toUtcIsoString(c.created_at),
      updated_at: toUtcIsoString(c.updated_at)
    };
  }
}

export const supplierContactService = new SupplierContactService();
