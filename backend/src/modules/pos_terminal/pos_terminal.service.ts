import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  posTerminalRepository,
  CreatePosTerminalInput,
  UpdatePosTerminalInput
} from "./pos_terminal.repository";

/**
 * Business layer for POS terminal operations.
 */
class PosTerminalService {
  /**
   * Lists active POS terminals for company scope.
   */
  async list(companyId: bigint) {
    const rows = await posTerminalRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  /**
   * Returns one POS terminal by id.
   */
  async getById(companyId: bigint, id: bigint) {
    const terminal = await posTerminalRepository.findById(companyId, id);
    if (!terminal) {
      throw new AppError("Terminal POS no encontrada", 404);
    }
    return this.serialize(terminal);
  }

  /**
   * Creates one POS terminal in company scope.
   */
  async create(companyId: bigint, dto: Omit<CreatePosTerminalInput, "company_id" | "warehouse_id"> & { warehouse_id: number }) {
    const existing = await posTerminalRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de terminal POS ya existe para la empresa", 409);
    }

    const warehouseId = BigInt(dto.warehouse_id);
    const warehouse = await posTerminalRepository.findWarehouseById(companyId, warehouseId);
    if (!warehouse) {
      throw new AppError("La bodega seleccionada no existe o está inactiva", 404);
    }

    const created = await posTerminalRepository.create({
      company_id: companyId,
      warehouse_id: warehouseId,
      code: dto.code,
      name: dto.name,
      device_name: dto.device_name,
      serial_number: dto.serial_number,
      is_active: dto.is_active
    });

    return this.getById(companyId, created.id);
  }

  /**
   * Updates one POS terminal in company scope.
   */
  async update(companyId: bigint, id: bigint, dto: Omit<UpdatePosTerminalInput, "warehouse_id"> & { warehouse_id?: number }) {
    await this.getById(companyId, id);

    let warehouseId: bigint | undefined;
    if (dto.warehouse_id !== undefined) {
      warehouseId = BigInt(dto.warehouse_id);
      const warehouse = await posTerminalRepository.findWarehouseById(companyId, warehouseId);
      if (!warehouse) {
        throw new AppError("La bodega seleccionada no existe o está inactiva", 404);
      }
    }

    await posTerminalRepository.update(companyId, id, {
      warehouse_id: warehouseId,
      name: dto.name,
      device_name: dto.device_name,
      serial_number: dto.serial_number,
      is_active: dto.is_active
    });

    return this.getById(companyId, id);
  }

  /**
   * Soft-deletes one POS terminal if it has no linked operations.
   */
  async remove(companyId: bigint, id: bigint) {
    const terminal = await posTerminalRepository.findById(companyId, id);
    if (!terminal) {
      throw new AppError("Terminal POS no encontrada", 404);
    }

    const dependencies = terminal._count.cash_registers + terminal._count.sales;
    if (dependencies > 0) {
      throw new AppError("No se puede eliminar la terminal POS porque tiene cajas o ventas asociadas", 409);
    }

    await posTerminalRepository.softDelete(companyId, id);
  }

  /**
   * Serializes Prisma POS terminal entities into API-safe payloads.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(terminal: any) {
    const cashRegistersCount = terminal._count?.cash_registers ?? 0;
    const salesCount = terminal._count?.sales ?? 0;
    const dependenciesCount = cashRegistersCount + salesCount;

    return {
      id: terminal.id.toString(),
      company_id: terminal.company_id.toString(),
      warehouse_id: terminal.warehouse_id.toString(),
      warehouse_code: terminal.warehouses?.code ?? null,
      warehouse_name: terminal.warehouses?.name ?? null,
      code: terminal.code,
      name: terminal.name,
      device_name: terminal.device_name ?? null,
      serial_number: terminal.serial_number ?? null,
      is_active: terminal.is_active,
      cash_registers_count: cashRegistersCount,
      sales_count: salesCount,
      dependencies_count: dependenciesCount,
      created_at: toUtcIsoString(terminal.created_at),
      updated_at: toUtcIsoString(terminal.updated_at)
    };
  }
}

export const posTerminalService = new PosTerminalService();
