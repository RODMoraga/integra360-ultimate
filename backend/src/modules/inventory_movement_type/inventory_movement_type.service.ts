import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  CreateInventoryMovementTypeInput,
  inventoryMovementTypeRepository,
  UpdateInventoryMovementTypeInput
} from "./inventory_movement_type.repository";

const RESERVED_INVENTORY_MOVEMENT_TYPE_CODES = new Set([
  "STOCK_IN",
  "STOCK_OUT",
  "TRANSFER",
  "ADJUST_IN",
  "ADJUST_OUT",
  "POS_SALE",
  "POS_SALE_CANCEL"
]);

class InventoryMovementTypeService {
  async list() {
    const rows = await inventoryMovementTypeRepository.findAll();
    return rows.map((row) => this.serialize(row));
  }

  async getById(id: bigint) {
    const row = await inventoryMovementTypeRepository.findById(id);
    if (!row) {
      throw new AppError("Tipo de movimiento de inventario no encontrado", 404);
    }

    return this.serialize(row);
  }

  async create(dto: CreateInventoryMovementTypeInput) {
    const data = this.normalizeInput(dto);
    const existing = await inventoryMovementTypeRepository.findByCode(data.code);

    if (existing) {
      throw new AppError("El código del tipo de movimiento ya existe", 409);
    }

    const created = await inventoryMovementTypeRepository.create(data);
    const createdWithCount = await inventoryMovementTypeRepository.findById(created.id);

    if (!createdWithCount) {
      throw new AppError("No fue posible recuperar el tipo de movimiento creado", 500);
    }

    return this.serialize(createdWithCount);
  }

  async update(id: bigint, dto: UpdateInventoryMovementTypeInput) {
    const current = await inventoryMovementTypeRepository.findById(id);
    if (!current) {
      throw new AppError("Tipo de movimiento de inventario no encontrado", 404);
    }

    const normalized = this.normalizeInput(dto);
    const nextCode = normalized.code ?? current.code;
    const nextDirection = normalized.direction ?? current.direction;
    const movementCount = current._count.inventory_movements;
    const isReserved = this.isReservedCode(current.code);

    if (normalized.code && normalized.code !== current.code) {
      const existing = await inventoryMovementTypeRepository.findByCode(normalized.code);
      if (existing && existing.id !== current.id) {
        throw new AppError("El código del tipo de movimiento ya existe", 409);
      }
    }

    if (isReserved && normalized.code && normalized.code !== current.code) {
      throw new AppError("Los tipos de movimiento de sistema no permiten cambiar el código", 409);
    }

    if (isReserved && normalized.direction && normalized.direction !== current.direction) {
      throw new AppError("Los tipos de movimiento de sistema no permiten cambiar la dirección", 409);
    }

    if (movementCount > 0 && nextCode !== current.code) {
      throw new AppError("No puede cambiar el código de un tipo de movimiento con movimientos asociados", 409);
    }

    if (movementCount > 0 && nextDirection !== current.direction) {
      throw new AppError("No puede cambiar la dirección de un tipo de movimiento con movimientos asociados", 409);
    }

    const updated = await inventoryMovementTypeRepository.update(id, normalized);
    const updatedWithCount = await inventoryMovementTypeRepository.findById(updated.id);

    if (!updatedWithCount) {
      throw new AppError("No fue posible recuperar el tipo de movimiento actualizado", 500);
    }

    return this.serialize(updatedWithCount);
  }

  async remove(id: bigint) {
    const current = await inventoryMovementTypeRepository.findById(id);
    if (!current) {
      throw new AppError("Tipo de movimiento de inventario no encontrado", 404);
    }

    if (this.isReservedCode(current.code)) {
      throw new AppError("Los tipos de movimiento de sistema no pueden eliminarse", 409);
    }

    if (current._count.inventory_movements > 0) {
      throw new AppError("No puede eliminar un tipo de movimiento con movimientos asociados", 409);
    }

    await inventoryMovementTypeRepository.delete(id);
  }

  private isReservedCode(code: string) {
    return RESERVED_INVENTORY_MOVEMENT_TYPE_CODES.has(code);
  }

  private normalizeInput<T extends CreateInventoryMovementTypeInput | UpdateInventoryMovementTypeInput>(dto: T): T {
    return {
      ...dto,
      code: dto.code?.trim().toUpperCase(),
      name: dto.name?.trim(),
      direction: dto.direction
    };
  }

  private serialize(
    row: Awaited<ReturnType<typeof inventoryMovementTypeRepository.findById>> extends infer T ? Exclude<T, null> : never
  ) {
    return {
      id: row.id.toString(),
      code: row.code,
      name: row.name,
      direction: row.direction,
      created_at: toUtcIsoString(row.created_at),
      movements_count: row._count.inventory_movements,
      is_system: this.isReservedCode(row.code)
    };
  }
}

export const inventoryMovementTypeService = new InventoryMovementTypeService();