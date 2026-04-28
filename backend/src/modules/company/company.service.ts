import { AppError } from "../../common/errors/app-error";
import { companyRepository, CreateCompanyInput, UpdateCompanyInput } from "./company.repository";

/**
 * Business layer for company operations.
 */
class CompanyService {
  /**
   * Lists active companies and serializes database types for API responses.
   */
  async list() {
    const rows = await companyRepository.findAll();
    return rows.map(this.serialize);
  }

  /**
   * Returns one company by id.
   * @throws AppError when the record does not exist.
   */
  async getById(id: bigint) {
    const company = await companyRepository.findById(id);
    if (!company) throw new AppError("Empresa no encontrada", 404);
    return this.serialize(company);
  }

  /**
   * Creates a new company after validating unique constraints.
   * @throws AppError when `code` or `tax_id` already exists.
   */
  async create(dto: CreateCompanyInput & { commune_id?: number }) {
    // Validate uniqueness before insert.
    const existing = await companyRepository.findByCode(dto.code);
    if (existing) throw new AppError("El código de empresa ya existe", 409);

    const existingTax = await companyRepository.findByTaxId(dto.tax_id);
    if (existingTax) throw new AppError("El RUT/Tax ID ya está registrado", 409);

    const data: CreateCompanyInput = {
      ...dto,
      commune_id: dto.commune_id ? BigInt(dto.commune_id) : undefined
    };

    const company = await companyRepository.create(data);
    return this.serialize(company);
  }

  /**
   * Updates an existing company.
   * @throws AppError when the company does not exist.
   */
  async update(id: bigint, dto: UpdateCompanyInput & { commune_id?: number }) {
    await this.getById(id);

    const data: UpdateCompanyInput = {
      ...dto,
      commune_id: dto.commune_id !== undefined
        ? (dto.commune_id ? BigInt(dto.commune_id) : undefined)
        : undefined
    };

    const updated = await companyRepository.update(id, data);
    return this.serialize(updated);
  }

  /**
   * Performs a soft-delete operation for a company.
   * @throws AppError when the company does not exist.
   */
  async remove(id: bigint) {
    await this.getById(id);
    await companyRepository.softDelete(id);
  }

  /**
   * Normalizes Prisma entities into API-safe JSON values.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(c: any) {
    return {
      id: c.id.toString(),
      code: c.code,
      legal_name: c.legal_name,
      trade_name: c.trade_name ?? null,
      tax_id: c.tax_id,
      industry_type: c.industry_type ?? null,
      email: c.email ?? null,
      phone: c.phone ?? null,
      address_line: c.address_line ?? null,
      commune_id: c.commune_id?.toString() ?? null,
      commune_name: c.communes?.name ?? null,
      city_name: c.communes?.cities?.name ?? null,
      region_name: c.communes?.cities?.regions?.name ?? null,
      timezone: c.timezone,
      currency_code: c.currency_code,
      is_active: c.is_active,
      created_at: c.created_at,
      updated_at: c.updated_at
    };
  }
}

export const companyService = new CompanyService();
