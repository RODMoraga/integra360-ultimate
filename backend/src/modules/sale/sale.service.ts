import { AppError } from "../../common/errors/app-error";
import { documentService } from "../document/document.service";
import { documentRepository } from "../document/document.repository";
import type { CreateDocumentDto, UpdateDocumentDto } from "../document/document.schema";
import type { documents_status } from "@prisma/client";

interface SaleListFilters {
  partner_name?: string;
  status?: documents_status;
  date_from?: Date;
  date_to?: Date;
}

class SaleService {
  async list(companyId: bigint, filters: SaleListFilters) {
    return documentService.list(companyId, filters);
  }

  async getById(companyId: bigint, id: bigint) {
    return documentService.getById(companyId, id);
  }

  async create(companyId: bigint, dto: CreateDocumentDto, createdBy?: bigint) {
    await this.validateDocumentTypeForSales(dto.document_type_id);
    return documentService.create(companyId, dto, createdBy);
  }

  async update(companyId: bigint, id: bigint, dto: UpdateDocumentDto) {
    return documentService.update(companyId, id, dto);
  }

  async remove(companyId: bigint, id: bigint) {
    return documentService.remove(companyId, id);
  }

  private async validateDocumentTypeForSales(documentTypeId: number) {
    const row = await documentRepository.findDocumentTypeById(BigInt(documentTypeId));
    if (!row) {
      throw new AppError("Tipo de documento no encontrado o inactivo", 404);
    }

    if (row.counterpart_scope === "SUPPLIER") {
      throw new AppError("El tipo de documento seleccionado corresponde a proveedor y no a venta", 400);
    }

    if (!row.affects_inventory) {
      throw new AppError("El tipo de documento de venta debe afectar inventario para registrar salidas automáticas", 400);
    }
  }
}

export const saleService = new SaleService();
