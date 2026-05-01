import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { productRoutes } from "../modules/product/product.routes";
import { companyRoutes } from "../modules/company/company.routes";
import { roleRoutes } from "../modules/role/role.routes";
import { permissionRoutes } from "../modules/permission/permission.routes";
import { regionRoutes } from "../modules/region/region.routes";
import { cityRoutes } from "../modules/city/city.routes";
import { communeRoutes } from "../modules/commune/commune.routes";
import { warehouseRoutes } from "../modules/warehouse/warehouse.routes";
import { customerRoutes } from "../modules/customer/customer.routes";
import { supplierRoutes } from "../modules/supplier/supplier.routes";
import { categoryRoutes } from "../modules/category/category.routes";
import { subcategoryRoutes } from "../modules/subcategory/subcategory.routes";
import { modelRoutes } from "../modules/model/model.routes";
import { brandRoutes } from "../modules/brand/brand.routes";
import { customerContactRoutes } from "../modules/customer_contact/customer_contact.routes";
import { supplierContactRoutes } from "../modules/supplier_contact/supplier_contact.routes";
import { unitOfMeasureRoutes } from "../modules/unit_of_measure/unit_of_measure.routes";
import { productImageRoutes } from "../modules/product_image/product_image.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "integra360-api" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/companies", companyRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);
router.use("/regions", regionRoutes);
router.use("/cities", cityRoutes);
router.use("/communes", communeRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/customers", customerRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/models", modelRoutes);
router.use("/brands", brandRoutes);
router.use("/customer-contacts", customerContactRoutes);
router.use("/supplier-contacts", supplierContactRoutes);
router.use("/units-of-measure", unitOfMeasureRoutes);
router.use("/product-images", productImageRoutes);

export const apiRoutes = router;