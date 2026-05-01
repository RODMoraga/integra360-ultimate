import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  cashRegisterRepository,
  CreateCashRegisterInput,
  UpdateCashRegisterInput
} from "./cash_register.repository";

class CashRegisterService {
  async list(companyId: bigint) {
    const rows = await cashRegisterRepository.findAll(companyId);
    return rows.map((row) => this.serialize(row));
  }

  async getById(companyId: bigint, id: bigint) {
    const cashRegister = await cashRegisterRepository.findById(companyId, id);
    if (!cashRegister) {
      throw new AppError("Caja no encontrada", 404);
    }
    return this.serialize(cashRegister);
  }

  async create(companyId: bigint, dto: Omit<CreateCashRegisterInput, "company_id" | "terminal_id"> & { terminal_id: number }) {
    const existing = await cashRegisterRepository.findByCode(companyId, dto.code);
    if (existing) {
      throw new AppError("El código de caja ya existe para la empresa", 409);
    }

    const terminalId = BigInt(dto.terminal_id);
    const terminal = await cashRegisterRepository.findTerminalById(companyId, terminalId);
    if (!terminal) {
      throw new AppError("La terminal POS seleccionada no existe o está inactiva", 404);
    }

    const created = await cashRegisterRepository.create({
      company_id: companyId,
      terminal_id: terminalId,
      code: dto.code,
      name: dto.name,
      is_active: dto.is_active
    });

    return this.getById(companyId, created.id);
  }

  async update(companyId: bigint, id: bigint, dto: Omit<UpdateCashRegisterInput, "terminal_id"> & { terminal_id?: number }) {
    await this.getById(companyId, id);

    let terminalId: bigint | undefined;
    if (dto.terminal_id !== undefined) {
      terminalId = BigInt(dto.terminal_id);
      const terminal = await cashRegisterRepository.findTerminalById(companyId, terminalId);
      if (!terminal) {
        throw new AppError("La terminal POS seleccionada no existe o está inactiva", 404);
      }
    }

    await cashRegisterRepository.update(companyId, id, {
      terminal_id: terminalId,
      name: dto.name,
      is_active: dto.is_active
    });

    return this.getById(companyId, id);
  }

  async remove(companyId: bigint, id: bigint) {
    const cashRegister = await cashRegisterRepository.findById(companyId, id);
    if (!cashRegister) {
      throw new AppError("Caja no encontrada", 404);
    }

    const dependencies = cashRegister._count.cash_openings;
    if (dependencies > 0) {
      throw new AppError("No se puede eliminar la caja porque tiene aperturas asociadas", 409);
    }

    await cashRegisterRepository.softDelete(companyId, id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serialize(cashRegister: any) {
    const openingsCount = cashRegister._count?.cash_openings ?? 0;

    return {
      id: cashRegister.id.toString(),
      company_id: cashRegister.company_id.toString(),
      terminal_id: cashRegister.terminal_id.toString(),
      terminal_code: cashRegister.pos_terminals?.code ?? null,
      terminal_name: cashRegister.pos_terminals?.name ?? null,
      code: cashRegister.code,
      name: cashRegister.name,
      is_active: cashRegister.is_active,
      cash_openings_count: openingsCount,
      dependencies_count: openingsCount,
      created_at: toUtcIsoString(cashRegister.created_at),
      updated_at: toUtcIsoString(cashRegister.updated_at)
    };
  }
}

export const cashRegisterService = new CashRegisterService();
