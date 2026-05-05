import { prisma } from "../../config/database";
import { toUtcIsoString } from "../../common/utils/datetime";

export interface SalesReportFilters {
  date_from?: Date;
  date_to?: Date;
  category_id?: bigint;
  brand_id?: bigint;
  model_id?: bigint;
  product_name?: string;
}

class ReportService {
  /**
   * Daily sales report: one row per sold line item, enriched with
   * product → category / brand / model data.  Only CONFIRMED documents
   * that belong to sales document types (counterpart_scope != SUPPLIER)
   * are included.
   */
  async dailySales(companyId: bigint, filters: SalesReportFilters) {
    const rows = await prisma.document_details.findMany({
      where: {
        documents: {
          company_id: companyId,
          deleted_at: null,
          status: "CONFIRMED",
          document_types: {
            counterpart_scope: { not: "SUPPLIER" }
          },
          ...(filters.date_from || filters.date_to
            ? {
                document_date: {
                  ...(filters.date_from ? { gte: filters.date_from } : {}),
                  ...(filters.date_to ? { lte: filters.date_to } : {})
                }
              }
            : {})
        },
        product_variants: {
          products: {
            deleted_at: null,
            ...(filters.category_id ? { category_id: filters.category_id } : {}),
            ...(filters.brand_id ? { brand_id: filters.brand_id } : {}),
            ...(filters.model_id ? { model_id: filters.model_id } : {}),
            ...(filters.product_name
              ? { name: { contains: filters.product_name, mode: "insensitive" as const } }
              : {})
          }
        }
      },
      include: {
        documents: {
          select: {
            id: true,
            sequence_number: true,
            document_date: true,
            status: true,
            document_types: { select: { id: true, code: true, name: true } },
            customers: { select: { id: true, code: true, legal_name: true } }
          }
        },
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
                name: true,
                categories: { select: { id: true, code: true, name: true } },
                brands: { select: { id: true, code: true, name: true } },
                models: { select: { id: true, code: true, name: true } }
              }
            }
          }
        },
        warehouses: { select: { id: true, code: true, name: true } }
      },
      orderBy: [
        { documents: { document_date: "desc" } },
        { documents: { id: "desc" } },
        { line_number: "asc" }
      ]
    });

    const serializedRows = rows.map((r) => this.serializeRow(r));
    const summary = this.buildSummary(serializedRows);
    const charts = this.buildCharts(serializedRows);

    return { rows: serializedRows, summary, charts };
  }

  private serializeRow(r: Awaited<ReturnType<typeof prisma.document_details.findMany>>[number]) {
    const doc = r.documents;
    const variant = r.product_variants;
    const product = variant?.products ?? null;

    return {
      detail_id: r.id.toString(),
      document_id: doc?.id.toString() ?? null,
      document_number: doc ? `${doc.document_types?.code ?? "DOC"}-${doc.sequence_number.toString()}` : null,
      document_date: toUtcIsoString(doc?.document_date ?? null),
      document_type_code: doc?.document_types?.code ?? null,
      document_type_name: doc?.document_types?.name ?? null,
      customer_id: doc?.customers?.id.toString() ?? null,
      customer_name: doc?.customers?.legal_name ?? null,
      line_number: r.line_number,
      product_variant_id: variant?.id.toString() ?? null,
      product_variant_code: variant?.variant_code ?? null,
      product_variant_name: variant?.name ?? null,
      product_variant_sku: variant?.sku ?? null,
      product_variant_barcode: variant?.barcode ?? null,
      product_id: product?.id.toString() ?? null,
      product_name: product?.name ?? null,
      product_sku: product?.sku ?? null,
      category_id: product?.categories?.id.toString() ?? null,
      category_name: product?.categories?.name ?? null,
      brand_id: product?.brands?.id.toString() ?? null,
      brand_name: product?.brands?.name ?? null,
      model_id: product?.models?.id.toString() ?? null,
      model_name: product?.models?.name ?? null,
      warehouse_id: r.warehouses?.id.toString() ?? null,
      warehouse_name: r.warehouses?.name ?? null,
      quantity: Number(r.quantity),
      unit_price: Number(r.unit_price),
      discount_amount: Number(r.discount_amount),
      tax_amount: Number(r.tax_amount),
      line_total: Number(r.line_total)
    };
  }

  private buildSummary(rows: ReturnType<typeof this.serializeRow>[]) {
    const total_amount = rows.reduce((s, r) => s + r.line_total, 0);
    const total_quantity = rows.reduce((s, r) => s + r.quantity, 0);
    const document_ids = new Set(rows.map((r) => r.document_id));
    const product_ids = new Set(rows.map((r) => r.product_id));

    return {
      total_amount,
      total_quantity,
      document_count: document_ids.size,
      product_count: product_ids.size
    };
  }

  private buildCharts(rows: ReturnType<typeof this.serializeRow>[]) {
    // Sales by day
    const byDay: Record<string, number> = {};
    for (const r of rows) {
      const day = r.document_date ? r.document_date.substring(0, 10) : "Sin fecha";
      byDay[day] = (byDay[day] ?? 0) + r.line_total;
    }
    const salesByDay = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));

    // Top 10 products by revenue
    const byProduct: Record<string, { name: string; amount: number; qty: number }> = {};
    for (const r of rows) {
      const key = r.product_id ?? "unknown";
      if (!byProduct[key]) {
        byProduct[key] = { name: r.product_name ?? "Sin nombre", amount: 0, qty: 0 };
      }
      byProduct[key].amount += r.line_total;
      byProduct[key].qty += r.quantity;
    }
    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    // Sales by category (donut)
    const byCategory: Record<string, { name: string; amount: number }> = {};
    for (const r of rows) {
      const key = r.category_id ?? "sin-categoria";
      if (!byCategory[key]) {
        byCategory[key] = { name: r.category_name ?? "Sin categoría", amount: 0 };
      }
      byCategory[key].amount += r.line_total;
    }
    const byCategories = Object.values(byCategory).sort((a, b) => b.amount - a.amount);

    return { salesByDay, topProducts, byCategories };
  }
}

export const reportService = new ReportService();
