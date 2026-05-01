import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import { warehouseRepository, CreateWarehouseInput, UpdateWarehouseInput } from "./warehouse.repository";

/**
 * Business layer for warehouse operations.
 */
class WarehouseService {
  /**
   * Lists active warehouses for company scope.
   */
  async list(companyId: bigint) {
    const rows = await warehouseRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one warehouse by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const warehouse = await warehouseRepository.findById(companyId, id);
    if (!warehouse) {
      throw new AppError("Bodega no encontrada", 404);
    }
    return this.serialize(warehouse);
  }

  /**
   * Creates one warehouse in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreateWarehouseInput, "company_id" | "commune_id"> & { commune_id?: number }) {
    const existing = await warehouseRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de bodega ya existe para la empresa", 409);
    }

    let communeId: bigint | undefined;
    if (dto.commune_id) {
      communeId = BigInt(dto.commune_id);
      const commune = await warehouseRepository.findCommuneById(communeId);
      if (!commune) {
        throw new AppError("La comuna seleccionada no existe", 404);
      }
    }

    if (dto.is_main) {
      await warehouseRepository.clearMainForCompany(companyId);
    }

    const created = await warehouseRepository.create({
      company_id: companyId,
      code: dto.code,
      name: dto.name,
      address_line: dto.address_line,
      commune_id: communeId,
      is_main: dto.is_main,
      is_active: dto.is_active
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one warehouse in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: Omit<UpdateWarehouseInput, "commune_id"> & { commune_id?: number }) {
    await this.getById(companyId, id);

    let communeId: bigint | undefined;
    if (dto.commune_id !== undefined) {
      if (dto.commune_id) {
        communeId = BigInt(dto.commune_id);
        const commune = await warehouseRepository.findCommuneById(communeId);
        if (!commune) {
          throw new AppError("La comuna seleccionada no existe", 404);
        }
      } else {
        communeId = undefined;
      }
    }

    if (dto.is_main) {
      await warehouseRepository.clearMainForCompany(companyId, id);
    }

    await warehouseRepository.update(companyId, id, {
      name: dto.name,
      address_line: dto.address_line,
      commune_id: dto.commune_id !== undefined ? communeId : undefined,
      is_main: dto.is_main,
      is_active: dto.is_active
    });

    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one warehouse if it has no linked operations.
   */
  async remove(companyId: bigint, id: bigint) {
    const warehouse = await warehouseRepository.findById(companyId, id);
    if (!warehouse) {
      throw new AppError("Bodega no encontrada", 404);
    }

    const dependencies =
      warehouse._count.inventory +
      warehouse._count.documents +
      warehouse._count.document_details +
      warehouse._count.pos_terminals +
      warehouse._count.sale_details +
      warehouse._count.inventory_movements_inventory_movements_warehouse_idTowarehouses +
      warehouse._count.inventory_movements_inventory_movements_related_warehouse_idTowarehouses;

    if (dependencies > 0) {
      throw new AppError("No se puede eliminar la bodega porque tiene movimientos o documentos asociados", 409);
    }

    await warehouseRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma warehouse entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(w: any) {
    const dependenciesCount =
      (w._count?.inventory ?? 0) +
      (w._count?.documents ?? 0) +
      (w._count?.document_details ?? 0) +
      (w._count?.pos_terminals ?? 0) +
      (w._count?.sale_details ?? 0) +
      (w._count?.inventory_movements_inventory_movements_warehouse_idTowarehouses ?? 0) +
      (w._count?.inventory_movements_inventory_movements_related_warehouse_idTowarehouses ?? 0);

    return {
      id: w.id.toString(),
      company_id: w.company_id.toString(),
      code: w.code,
      name: w.name,
      address_line: w.address_line ?? null,
      commune_id: w.commune_id?.toString() ?? null,
      commune_name: w.communes?.name ?? null,
      city_name: w.communes?.cities?.name ?? null,
      region_name: w.communes?.cities?.regions?.name ?? null,
      is_main: w.is_main,
      is_active: w.is_active,
      dependencies_count: dependenciesCount,
      created_at: toUtcIsoString(w.created_at),
      updated_at: toUtcIsoString(w.updated_at)
    };
  }
}

export const warehouseService = new WarehouseService();
