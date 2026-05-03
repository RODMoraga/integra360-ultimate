import { documents_status, document_types_counterpart_scope, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export interface DocumentListFilters {
  partner_name?: string;
  status?: documents_status;
  date_from?: Date;
  date_to?: Date;
}

export interface CreateDocumentInput {
  company_id: bigint;
  document_type_id: bigint;
  sequence_number: bigint;
  document_date: Date;
  warehouse_id?: bigint;
  customer_id?: bigint;
  supplier_id?: bigint;
  status: documents_status;
  subtotal: number;
  tax_total: number;
  discount_total: number;
  total: number;
  notes?: string | null;
  confirmed_at?: Date | null;
  created_by?: bigint;
}

export interface CreateDocumentDetailInput {
  company_id: bigint;
  line_number: number;
  product_variant_id: bigint;
  warehouse_id?: bigint;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
}

export interface UpdateDocumentInput {
  document_date?: Date;
  warehouse_id?: bigint | null;
  customer_id?: bigint | null;
  supplier_id?: bigint | null;
  status?: documents_status;
  subtotal?: number;
  tax_total?: number;
  discount_total?: number;
  total?: number;
  notes?: string | null;
  confirmed_at?: Date | null;
}

export interface InventoryScopeInput {
  warehouse_id: bigint;
  product_variant_id: bigint;
}

const documentInclude = {
  document_types: {
    select: {
      id: true,
      code: true,
      name: true,
      counterpart_scope: true,
      deleted_at: true
    }
  },
  customers: {
    select: {
      id: true,
      code: true,
      legal_name: true
    }
  },
  suppliers: {
    select: {
      id: true,
      code: true,
      legal_name: true
    }
  },
  warehouses: {
    select: {
      id: true,
      code: true,
      name: true
    }
  },
  document_details: {
    orderBy: { line_number: "asc" as const },
    include: {
      product_variants: {
        select: {
          id: true,
          variant_code: true,
          name: true,
          sku: true,
          barcode: true,
          products: {
            select: {
              id: true,
              sku: true,
              name: true
            }
          }
        }
      },
      warehouses: {
        select: {
          id: true,
          code: true,
          name: true
        }
      }
    }
  }
} as const;

class DocumentRepository {
  list(companyId: bigint, filters: DocumentListFilters) {
    const where: Prisma.documentsWhereInput = {
      company_id: companyId,
      deleted_at: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.date_from || filters.date_to
        ? {
          document_date: {
            ...(filters.date_from ? { gte: filters.date_from } : {}),
            ...(filters.date_to ? { lte: filters.date_to } : {})
          }
        }
        : {}),
      ...(filters.partner_name
        ? {
          OR: [
            { customers: { legal_name: { contains: filters.partner_name } } },
            { suppliers: { legal_name: { contains: filters.partner_name } } }
          ]
        }
        : {})
    };

    return prisma.documents.findMany({
      where,
      include: {
        document_types: { select: { code: true, name: true, counterpart_scope: true } },
        customers: { select: { code: true, legal_name: true } },
        suppliers: { select: { code: true, legal_name: true } },
        warehouses: { select: { code: true, name: true } },
        _count: { select: { document_details: true } }
      },
      orderBy: [{ document_date: "desc" }, { id: "desc" }]
    });
  }

  findById(companyId: bigint, id: bigint) {
    return prisma.documents.findFirst({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      include: documentInclude
    });
  }

  findDocumentTypeById(id: bigint) {
    return prisma.document_types.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        code: true,
        name: true,
        counterpart_scope: true,
        affects_inventory: true
      }
    });
  }

  findWarehouseById(companyId: bigint, id: bigint) {
    return prisma.warehouses.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      select: { id: true, code: true, name: true }
    });
  }

  findCustomerById(companyId: bigint, id: bigint) {
    return prisma.customers.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      select: { id: true, code: true, legal_name: true }
    });
  }

  findSupplierById(companyId: bigint, id: bigint) {
    return prisma.suppliers.findFirst({
      where: { id, company_id: companyId, deleted_at: null },
      select: { id: true, code: true, legal_name: true }
    });
  }

  findProductVariantById(companyId: bigint, id: bigint) {
    return prisma.product_variants.findFirst({
      where: { id, company_id: companyId, deleted_at: null, is_active: true },
      select: {
        id: true,
        variant_code: true,
        name: true,
        sku: true,
        barcode: true,
        sale_price: true,
        products: {
          select: { id: true, sku: true, name: true }
        }
      }
    });
  }

  findInventoryByScopes(companyId: bigint, scopes: InventoryScopeInput[]) {
    if (scopes.length === 0) {
      return Promise.resolve([]);
    }

    return prisma.inventory.findMany({
      where: {
        company_id: companyId,
        OR: scopes.map((scope) => ({
          warehouse_id: scope.warehouse_id,
          product_variant_id: scope.product_variant_id
        }))
      },
      select: {
        warehouse_id: true,
        product_variant_id: true,
        quantity_available: true
      }
    });
  }

  findSequence(companyId: bigint, documentTypeId: bigint, yearNum: number) {
    return prisma.document_sequences.findFirst({
      where: {
        company_id: companyId,
        document_type_id: documentTypeId,
        year_num: yearNum
      },
      select: {
        id: true,
        next_number: true
      }
    });
  }

  async createWithDetails(sequenceId: bigint, header: CreateDocumentInput, details: CreateDocumentDetailInput[]) {
    const created = await prisma.$transaction(async (tx) => {
      await tx.document_sequences.update({
        where: { id: sequenceId },
        data: { next_number: { increment: 1 } }
      });

      return tx.documents.create({
        data: {
          ...header,
          document_details: {
            create: details.map((line) => ({
              company_id: line.company_id,
              line_number: line.line_number,
              product_variant_id: line.product_variant_id,
              warehouse_id: line.warehouse_id,
              quantity: line.quantity,
              unit_price: line.unit_price,
              discount_amount: line.discount_amount,
              tax_amount: line.tax_amount,
              line_total: line.line_total,
              created_at: new Date(),
              updated_at: new Date()
            }))
          }
        }
      });
    });

    return created;
  }

  async replaceDetails(companyId: bigint, documentId: bigint, header: UpdateDocumentInput, details: CreateDocumentDetailInput[]) {
    await prisma.$transaction(async (tx) => {
      await tx.documents.updateMany({
        where: { id: documentId, company_id: companyId, deleted_at: null },
        data: {
          ...header,
          updated_at: new Date()
        }
      });

      await tx.document_details.deleteMany({
        where: { document_id: documentId, company_id: companyId }
      });

      if (details.length > 0) {
        await tx.document_details.createMany({
          data: details.map((line) => ({
            company_id: line.company_id,
            document_id: documentId,
            line_number: line.line_number,
            product_variant_id: line.product_variant_id,
            warehouse_id: line.warehouse_id,
            quantity: line.quantity,
            unit_price: line.unit_price,
            discount_amount: line.discount_amount,
            tax_amount: line.tax_amount,
            line_total: line.line_total,
            created_at: new Date(),
            updated_at: new Date()
          }))
        });
      }
    });
  }

  updateHeader(companyId: bigint, documentId: bigint, header: UpdateDocumentInput) {
    return prisma.documents.updateMany({
      where: {
        id: documentId,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        ...header,
        updated_at: new Date()
      }
    });
  }

  softDelete(companyId: bigint, id: bigint) {
    return prisma.documents.updateMany({
      where: {
        id,
        company_id: companyId,
        deleted_at: null
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date()
      }
    });
  }
}

export const documentRepository = new DocumentRepository();
export { document_types_counterpart_scope };
