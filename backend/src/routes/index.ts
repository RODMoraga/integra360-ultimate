import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { productRoutes } from "../modules/product/product.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "integra360-api" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);

export const apiRoutes = router;