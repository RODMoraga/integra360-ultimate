import { type Request, type Response } from "express";
import { reportService } from "./report.service";

class ReportController {
  /**
   * GET /api/reports/sales-daily
   * Query params: date_from, date_to, category_id, brand_id, model_id, product_name
   */
  async dailySales(req: Request, res: Response): Promise<void> {
    const companyId = BigInt(req.user?.companyId ?? 2);

    const dateFrom =
      typeof req.query.date_from === "string" && req.query.date_from
        ? new Date(`${req.query.date_from}T00:00:00.000Z`)
        : undefined;

    const dateTo =
      typeof req.query.date_to === "string" && req.query.date_to
        ? new Date(`${req.query.date_to}T23:59:59.999Z`)
        : undefined;

    const categoryId =
      typeof req.query.category_id === "string" && req.query.category_id
        ? BigInt(req.query.category_id)
        : undefined;

    const brandId =
      typeof req.query.brand_id === "string" && req.query.brand_id
        ? BigInt(req.query.brand_id)
        : undefined;

    const modelId =
      typeof req.query.model_id === "string" && req.query.model_id
        ? BigInt(req.query.model_id)
        : undefined;

    const productName =
      typeof req.query.product_name === "string" && req.query.product_name.trim()
        ? req.query.product_name.trim()
        : undefined;

    const result = await reportService.dailySales(companyId, {
      date_from: dateFrom && !Number.isNaN(dateFrom.getTime()) ? dateFrom : undefined,
      date_to: dateTo && !Number.isNaN(dateTo.getTime()) ? dateTo : undefined,
      category_id: categoryId,
      brand_id: brandId,
      model_id: modelId,
      product_name: productName
    });

    res.status(200).json(result);
  }
}

export const reportController = new ReportController();
