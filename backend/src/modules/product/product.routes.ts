import { Router } from "express";
import { prisma } from "../../config/database";
import { requireAuth } from "../auth/auth.middleware";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const products = await prisma.products.findMany({ orderBy: { id: "desc" } });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

export const productRoutes = router;