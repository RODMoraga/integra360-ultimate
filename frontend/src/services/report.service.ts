import { api } from "./api";

export interface SalesReportRow {
  detail_id: string;
  document_id: string | null;
  document_number: string | null;
  document_date: string | null;
  document_type_code: string | null;
  document_type_name: string | null;
  customer_id: string | null;
  customer_name: string | null;
  line_number: number;
  product_variant_id: string | null;
  product_variant_code: string | null;
  product_variant_name: string | null;
  product_variant_sku: string | null;
  product_variant_barcode: string | null;
  product_id: string | null;
  product_name: string | null;
  product_sku: string | null;
  category_id: string | null;
  category_name: string | null;
  brand_id: string | null;
  brand_name: string | null;
  model_id: string | null;
  model_name: string | null;
  warehouse_id: string | null;
  warehouse_name: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number;
}

export interface SalesReportSummary {
  total_amount: number;
  total_quantity: number;
  document_count: number;
  product_count: number;
}

export interface SalesReportChartDay {
  date: string;
  amount: number;
}

export interface SalesReportChartProduct {
  name: string;
  amount: number;
  qty: number;
}

export interface SalesReportChartCategory {
  name: string;
  amount: number;
}

export interface SalesReportCharts {
  salesByDay: SalesReportChartDay[];
  topProducts: SalesReportChartProduct[];
  byCategories: SalesReportChartCategory[];
}

export interface SalesReportResult {
  rows: SalesReportRow[];
  summary: SalesReportSummary;
  charts: SalesReportCharts;
}

export interface SalesReportFilters {
  date_from?: string;
  date_to?: string;
  category_id?: string | number;
  brand_id?: string | number;
  model_id?: string | number;
  product_name?: string;
}

export const reportService = {
  async getDailySales(filters: SalesReportFilters = {}): Promise<SalesReportResult> {
    const params: Record<string, string> = {};
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.category_id) params.category_id = String(filters.category_id);
    if (filters.brand_id) params.brand_id = String(filters.brand_id);
    if (filters.model_id) params.model_id = String(filters.model_id);
    if (filters.product_name) params.product_name = filters.product_name;

    const { data } = await api.get<SalesReportResult>("/reports/sales-daily", { params });
    return data;
  }
};
