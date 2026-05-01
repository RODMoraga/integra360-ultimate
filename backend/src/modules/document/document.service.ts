import { AppError } from "../../common/errors/app-error";
import { toUtcIsoString } from "../../common/utils/datetime";
import {
  documentRepository,
  document_types_counterpart_scope,
  type CreateDocumentDetailInput,
  type CreateDocumentInput,
  type DocumentListFilters,
  type UpdateDocumentInput
} from "./document.repository";
import type { CreateDocumentDto, UpdateDocumentDto } from "./document.schema";
import { documents_status } from "@prisma/client";

class DocumentService {
  async list(companyId: bigint, filters: DocumentListFilters) {
    const rows = await documentRepository.list(companyId, filters);
    return rows.map((row) => this.serializeSummary(row));
  }

  async getById(companyId: bigint, id: bigint) {
    const row = await documentRepository.findById(companyId, id);
    if (!row) {
      throw new AppError("Documento no encontrado", 404);
    }

    return this.serializeDetail(row);
  }

  async create(companyId: bigint, dto: CreateDocumentDto, createdBy?: bigint) {
    const documentDate = dto.document_date ?? new Date();

    const documentTypeId = BigInt(dto.document_type_id);
    const documentType = await documentRepository.findDocumentTypeById(documentTypeId);
    if (!documentType) {
      throw new AppError("Tipo de documento no encontrado o inactivo", 404);
    }

    await this.validateCounterpart(companyId, documentType.counterpart_scope, dto.customer_id, dto.supplier_id);
    await this.validateWarehouses(companyId, dto.warehouse_id, dto.details ?? []);

    const detailRows = await this.buildDetails(companyId, dto.details);
    const totals = this.calculateTotals(detailRows);

    const yearNum = documentDate.getUTCFullYear();
    const sequence = await documentRepository.findSequence(companyId, documentTypeId, yearNum);
    if (!sequence) {
      throw new AppError("No existe secuencia configurada para el tipo de documento y año indicado", 409);
    }

    const status = dto.status ?? "DRAFT";
    const confirmedAt = status === "CONFIRMED" ? new Date() : null;

    const created = await documentRepository.createWithDetails(sequence.id, {
      company_id: companyId,
      document_type_id: documentTypeId,
      sequence_number: sequence.next_number,
      document_date: documentDate,
      warehouse_id: dto.warehouse_id ? BigInt(dto.warehouse_id) : undefined,
      customer_id: dto.customer_id ? BigInt(dto.customer_id) : undefined,
      supplier_id: dto.supplier_id ? BigInt(dto.supplier_id) : undefined,
      status,
      subtotal: totals.subtotal,
      tax_total: totals.tax_total,
      discount_total: totals.discount_total,
      total: totals.total,
      notes: this.normalizeNotes(dto.notes),
      confirmed_at: confirmedAt,
      created_by: createdBy
    } satisfies CreateDocumentInput, detailRows);

    return this.getById(companyId, created.id);
  }

  async update(companyId: bigint, id: bigint, dto: UpdateDocumentDto) {
    const current = await documentRepository.findById(companyId, id);
    if (!current) {
      throw new AppError("Documento no encontrado", 404);
    }

    const documentType = await documentRepository.findDocumentTypeById(current.document_type_id);
    if (!documentType) {
      throw new AppError("El tipo de documento asociado no está disponible", 409);
    }

    const nextCustomerId = dto.customer_id !== undefined ? dto.customer_id : (current.customer_id ? Number(current.customer_id) : undefined);
    const nextSupplierId = dto.supplier_id !== undefined ? dto.supplier_id : (current.supplier_id ? Number(current.supplier_id) : undefined);

    await this.validateCounterpart(companyId, documentType.counterpart_scope, nextCustomerId, nextSupplierId);
    await this.validateWarehouses(companyId, dto.warehouse_id, dto.details ?? []);

    const nextStatus = dto.status ?? current.status;
    const confirmedAt = nextStatus === "CONFIRMED"
      ? (current.confirmed_at ?? new Date())
      : null;

    if (dto.details) {
      const detailRows = await this.buildDetails(companyId, dto.details);
      const totals = this.calculateTotals(detailRows);

      await documentRepository.replaceDetails(companyId, id, {
        document_date: dto.document_date ?? current.document_date,
        warehouse_id: dto.warehouse_id !== undefined
          ? (dto.warehouse_id ? BigInt(dto.warehouse_id) : null)
          : current.warehouse_id,
        customer_id: dto.customer_id !== undefined
          ? (dto.customer_id ? BigInt(dto.customer_id) : null)
          : current.customer_id,
        supplier_id: dto.supplier_id !== undefined
          ? (dto.supplier_id ? BigInt(dto.supplier_id) : null)
          : current.supplier_id,
        status: nextStatus,
        subtotal: totals.subtotal,
        tax_total: totals.tax_total,
        discount_total: totals.discount_total,
        total: totals.total,
        notes: dto.notes !== undefined ? this.normalizeNotes(dto.notes) : current.notes,
        confirmed_at: confirmedAt
      } satisfies UpdateDocumentInput, detailRows);
    } else {
      await documentRepository.updateHeader(companyId, id, {
        document_date: dto.document_date ?? current.document_date,
        warehouse_id: dto.warehouse_id !== undefined
          ? (dto.warehouse_id ? BigInt(dto.warehouse_id) : null)
          : current.warehouse_id,
        customer_id: dto.customer_id !== undefined
          ? (dto.customer_id ? BigInt(dto.customer_id) : null)
          : current.customer_id,
        supplier_id: dto.supplier_id !== undefined
          ? (dto.supplier_id ? BigInt(dto.supplier_id) : null)
          : current.supplier_id,
        status: nextStatus,
        notes: dto.notes !== undefined ? this.normalizeNotes(dto.notes) : current.notes,
        confirmed_at: confirmedAt
      } satisfies UpdateDocumentInput);
    }

    return this.getById(companyId, id);
  }

  async remove(companyId: bigint, id: bigint) {
    await this.getById(companyId, id);
    await documentRepository.softDelete(companyId, id);
  }

  private normalizeNotes(value?: string): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private async validateCounterpart(
    companyId: bigint,
    counterpartScope: document_types_counterpart_scope,
    customerId?: number,
    supplierId?: number
  ) {
    if (counterpartScope === "CUSTOMER") {
      if (!customerId) {
        throw new AppError("El tipo de documento requiere cliente", 400);
      }

      const customer = await documentRepository.findCustomerById(companyId, BigInt(customerId));
      if (!customer) {
        throw new AppError("Cliente no encontrado", 404);
      }

      return;
    }

    if (counterpartScope === "SUPPLIER") {
      if (!supplierId) {
        throw new AppError("El tipo de documento requiere proveedor", 400);
      }

      const supplier = await documentRepository.findSupplierById(companyId, BigInt(supplierId));
      if (!supplier) {
        throw new AppError("Proveedor no encontrado", 404);
      }

      return;
    }

    if (customerId) {
      const customer = await documentRepository.findCustomerById(companyId, BigInt(customerId));
      if (!customer) {
        throw new AppError("Cliente no encontrado", 404);
      }
    }

    if (supplierId) {
      const supplier = await documentRepository.findSupplierById(companyId, BigInt(supplierId));
      if (!supplier) {
        throw new AppError("Proveedor no encontrado", 404);
      }
    }
  }

  private async validateWarehouses(
    companyId: bigint,
    headerWarehouseId: number | undefined,
    details: Array<{ warehouse_id?: number }>
  ) {
    if (headerWarehouseId) {
      const headerWarehouse = await documentRepository.findWarehouseById(companyId, BigInt(headerWarehouseId));
      if (!headerWarehouse) {
        throw new AppError("Bodega de encabezado no encontrada", 404);
      }
    }

    const warehouseIds = new Set<number>();
    details.forEach((line) => {
      if (line.warehouse_id) {
        warehouseIds.add(line.warehouse_id);
      }
    });

    for (const id of warehouseIds) {
      const warehouse = await documentRepository.findWarehouseById(companyId, BigInt(id));
      if (!warehouse) {
        throw new AppError(`Bodega no encontrada para detalle (id ${id})`, 404);
      }
    }
  }

  private async buildDetails(
    companyId: bigint,
    details: Array<{
      product_variant_id: number;
      warehouse_id?: number;
      quantity: number;
      unit_price: number;
      discount_amount?: number;
      tax_amount?: number;
    }>
  ): Promise<CreateDocumentDetailInput[]> {
    const lines: CreateDocumentDetailInput[] = [];

    for (let index = 0; index < details.length; index += 1) {
      const line = details[index];

      const variant = await documentRepository.findProductVariantById(companyId, BigInt(line.product_variant_id));
      if (!variant) {
        throw new AppError(`Variante de producto no encontrada para línea ${index + 1}`, 404);
      }

      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unit_price);
      const discountAmount = Number(line.discount_amount ?? 0);
      const taxAmount = Number(line.tax_amount ?? 0);
      const lineSubtotal = quantity * unitPrice;
      const lineTotal = lineSubtotal - discountAmount + taxAmount;

      if (lineTotal < 0) {
        throw new AppError(`El total de la línea ${index + 1} no puede ser negativo`, 400);
      }

      lines.push({
        company_id: companyId,
        line_number: index + 1,
        product_variant_id: BigInt(line.product_variant_id),
        warehouse_id: line.warehouse_id ? BigInt(line.warehouse_id) : undefined,
        quantity,
        unit_price: unitPrice,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        line_total: lineTotal
      });
    }

    return lines;
  }

  private calculateTotals(details: CreateDocumentDetailInput[]) {
    const subtotal = details.reduce((acc, line) => acc + (line.quantity * line.unit_price), 0);
    const discount_total = details.reduce((acc, line) => acc + line.discount_amount, 0);
    const tax_total = details.reduce((acc, line) => acc + line.tax_amount, 0);
    const total = subtotal - discount_total + tax_total;

    return {
      subtotal,
      discount_total,
      tax_total,
      total
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serializeSummary(row: any) {
    return {
      id: row.id.toString(),
      company_id: row.company_id.toString(),
      document_type_id: row.document_type_id.toString(),
      document_type_code: row.document_types?.code ?? null,
      document_type_name: row.document_types?.name ?? null,
      counterpart_scope: row.document_types?.counterpart_scope ?? null,
      sequence_number: row.sequence_number.toString(),
      document_number_label: `${row.document_types?.code ?? "DOC"}-${row.sequence_number.toString()}`,
      document_date: toUtcIsoString(row.document_date),
      warehouse_id: row.warehouse_id?.toString() ?? null,
      warehouse_code: row.warehouses?.code ?? null,
      warehouse_name: row.warehouses?.name ?? null,
      customer_id: row.customer_id?.toString() ?? null,
      customer_code: row.customers?.code ?? null,
      customer_name: row.customers?.legal_name ?? null,
      supplier_id: row.supplier_id?.toString() ?? null,
      supplier_code: row.suppliers?.code ?? null,
      supplier_name: row.suppliers?.legal_name ?? null,
      partner_name: row.customers?.legal_name ?? row.suppliers?.legal_name ?? null,
      status: row.status,
      subtotal: Number(row.subtotal),
      tax_total: Number(row.tax_total),
      discount_total: Number(row.discount_total),
      total: Number(row.total),
      notes: row.notes ?? null,
      confirmed_at: row.confirmed_at ? toUtcIsoString(row.confirmed_at) : null,
      details_count: Number(row._count?.document_details ?? 0),
      created_at: toUtcIsoString(row.created_at),
      updated_at: toUtcIsoString(row.updated_at)
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private serializeDetail(row: any) {
    return {
      ...this.serializeSummary(row),
      details: (row.document_details ?? []).map((detail: any) => ({
        id: detail.id.toString(),
        line_number: detail.line_number,
        product_variant_id: detail.product_variant_id.toString(),
        product_variant_code: detail.product_variants?.variant_code ?? null,
        product_variant_name: detail.product_variants?.name ?? null,
        product_variant_sku: detail.product_variants?.sku ?? null,
        product_variant_barcode: detail.product_variants?.barcode ?? null,
        product_name: detail.product_variants?.products?.name ?? null,
        product_sku: detail.product_variants?.products?.sku ?? null,
        warehouse_id: detail.warehouse_id?.toString() ?? null,
        warehouse_code: detail.warehouses?.code ?? null,
        warehouse_name: detail.warehouses?.name ?? null,
        quantity: Number(detail.quantity),
        unit_price: Number(detail.unit_price),
        discount_amount: Number(detail.discount_amount),
        tax_amount: Number(detail.tax_amount),
        line_total: Number(detail.line_total)
      }))
    };
  }
}

export const documentService = new DocumentService();
export { documents_status };
