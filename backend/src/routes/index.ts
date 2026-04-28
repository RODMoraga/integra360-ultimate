import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { productRoutes } from "../modules/product/product.routes";
import { companyRoutes } from "../modules/company/company.routes";
import { roleRoutes } from "../modules/role/role.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "integra360-api" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/companies", companyRoutes);
router.use("/roles", roleRoutes);

export const apiRoutes = router;