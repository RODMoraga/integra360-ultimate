import { prisma } from "../../config/database";

export interface CreateInventoryMovementTypeInput {
  code: string;
  name: string;
  direction: "IN" | "OUT" | "TRANSFER";
}

export interface UpdateInventoryMovementTypeInput extends Partial<CreateInventoryMovementTypeInput> {}

class InventoryMovementTypeRepository {
  findAll() {
    return prisma.inventory_movement_types.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        direction: true,
        created_at: true,
        _count: {
          select: {
            inventory_movements: true
          }
        }
      },
      orderBy: { id: "desc" }
    });
  }

  findById(id: bigint) {
    return prisma.inventory_movement_types.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        direction: true,
        created_at: true,
        _count: {
          select: {
            inventory_movements: true
          }
        }
      }
    });
  }

  findByCode(code: string) {
    return prisma.inventory_movement_types.findUnique({ where: { code } });
  }

  create(data: CreateInventoryMovementTypeInput) {
    return prisma.inventory_movement_types.create({
      data
    });
  }

  update(id: bigint, data: UpdateInventoryMovementTypeInput) {
    return prisma.inventory_movement_types.update({
      where: { id },
      data
    });
  }

  delete(id: bigint) {
    return prisma.inventory_movement_types.delete({ where: { id } });
  }
}

export const inventoryMovementTypeRepository = new InventoryMovementTypeRepository();