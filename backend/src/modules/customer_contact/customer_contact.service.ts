import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  customerContactRepository,
  CreateCustomerContactInput,
  UpdateCustomerContactInput
} from "./customer_contact.repository";

/**
 * Business layer for customer contact operations.
 */
class CustomerContactService {
  /**
   * Lists active contacts for the given company.
   */
  async list(companyId: bigint) {
    const rows = await customerContactRepository.findAll(companyId);
    return rows.map(this.serialize);
  }

  /**
   * Returns one contact by id within company scope.
   * @throws AppError when the record does not exist.
   */
  async getById(companyId: bigint, id: bigint) {
    const row = await customerContactRepository.findById(companyId, id);
    if (!row) throw new AppError("Contacto no encontrado", 404);
    return this.serialize(row);
  }

  /**
   * Creates a new customer contact.
   */
  async create(
    companyId: bigint,
    dto: Omit<CreateCustomerContactInput, "company_id" | "customer_id"> & { customer_id: number }
  ) {
    const data: CreateCustomerContactInput = {
      ...dto,
      company_id: companyId,
      customer_id: BigInt(dto.customer_id)
    };

    const row = await customerContactRepository.create(data);
    return this.serialize(row);
  }

  /**
   * Updates an existing contact.
   * @throws AppError when the record does not exist.
   */
  async update(companyId: bigint, id: bigint, dto: UpdateCustomerContactInput) {
    await this.getById(companyId, id);
    const updated = await customerContactRepository.update(id, dto);
    return this.serialize(updated);
  }

  /**
   * Soft-deletes a contact.
   * @throws AppError when the record does not exist.
   */
  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await customerContactRepository.softDelete(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    return {
      id: c.id.toString(),
      company_id: c.company_id.toString(),
      customer_id: c.customer_id.toString(),
      customer_legal_name: c.customers?.legal_name ?? null,
      customer_code: c.customers?.code ?? null,
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

export const customerContactService = new CustomerContactService();
