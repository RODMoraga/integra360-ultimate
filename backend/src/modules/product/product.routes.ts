import { Router } from "express";
import { prisma } from "../../config/database";
import { requireAuth } from "../auth/auth.middleware";

/**
 * Product routes.
 */
const router = Router();

/**
 * GET /products
 * Returns products ordered by newest first.
 */
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const products = await prisma.products.findMany({ orderBy: { id: "desc" } });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

export const productRoutes = router;