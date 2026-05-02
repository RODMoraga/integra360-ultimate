-- Minimal, idempotent seed for inventory (company_id = 2)
-- Behavior:
-- 1) Ensures a demo product/variant and demo warehouse exist as prerequisites.
-- 2) Ensures a free inventory record (no dependencies) for CRUD smoke tests.
-- 3) Ensures an inventory record with low stock (quantity_on_hand <= reorder_point).

-- Step 1: Ensure demo warehouse exists.
INSERT INTO warehouses (
  company_id, code, name, address_line, commune_id,
  is_main, is_active, created_at, updated_at, deleted_at
)
SELECT
  2, 'DEMO-INV-WH', 'Bodega Demo Inventario', 'Bodega tecnica para inventario demo',
  NULL, 0, 1, UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL
WHERE NOT EXISTS (
  SELECT 1 FROM warehouses w
  WHERE w.company_id = 2 AND w.code = 'DEMO-INV-WH' AND w.deleted_at IS NULL
);

-- Step 2: Ensure demo product exists (no category/subcategory required).
INSERT INTO products (
  company_id, sku, name, base_uom_id, description,
  is_active, created_at, updated_at
)
SELECT
  2, 'DEMO-INV-PROD', 'Producto Demo Inventario', u.id,
  'Producto tecnico para pruebas de inventario',
  1, UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM units_of_measure u
WHERE u.company_id = 2 AND u.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE p.company_id = 2 AND p.sku = 'DEMO-INV-PROD' AND p.deleted_at IS NULL
  )
ORDER BY u.id ASC
LIMIT 1;

-- Step 3: Ensure demo variant A (FREE record — no movements).
INSERT INTO product_variants (
  company_id, product_id, variant_code, name, sku, barcode,
  cost_price, sale_price, is_active, created_at, updated_at, deleted_at
)
SELECT
  2,
  p.id,
  'DEMO-INV-VAR-A',
  'Variante Demo A',
  'SKU-INV-DEMO-A',
  NULL,
  0.0000, 0.0000, 1,
  UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL
FROM products p
WHERE p.company_id = 2 AND p.sku = 'DEMO-INV-PROD' AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.company_id = 2 AND pv.variant_code = 'DEMO-INV-VAR-A' AND pv.deleted_at IS NULL
  );

-- Step 4: Ensure demo variant B (LOW STOCK record).
INSERT INTO product_variants (
  company_id, product_id, variant_code, name, sku, barcode,
  cost_price, sale_price, is_active, created_at, updated_at, deleted_at
)
SELECT
  2,
  p.id,
  'DEMO-INV-VAR-B',
  'Variante Demo B',
  'SKU-INV-DEMO-B',
  NULL,
  0.0000, 0.0000, 1,
  UTC_TIMESTAMP(), UTC_TIMESTAMP(), NULL
FROM products p
WHERE p.company_id = 2 AND p.sku = 'DEMO-INV-PROD' AND p.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_variants pv
    WHERE pv.company_id = 2 AND pv.variant_code = 'DEMO-INV-VAR-B' AND pv.deleted_at IS NULL
  );

-- Step 5: Ensure free inventory record (Variante A in Demo Warehouse).
INSERT INTO inventory (
  company_id, warehouse_id, product_variant_id,
  quantity_on_hand, quantity_reserved, quantity_available,
  min_stock, max_stock, reorder_point,
  created_at, updated_at
)
SELECT
  2,
  w.id,
  pv.id,
  100.0000, 10.0000, 90.0000,
  5.0000, 500.0000, 20.0000,
  UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM warehouses w
JOIN products p ON p.company_id = 2 AND p.sku = 'DEMO-INV-PROD' AND p.deleted_at IS NULL
JOIN product_variants pv ON pv.company_id = 2 AND pv.variant_code = 'DEMO-INV-VAR-A' AND pv.deleted_at IS NULL
WHERE w.company_id = 2 AND w.code = 'DEMO-INV-WH' AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM inventory i
    WHERE i.company_id = 2
      AND i.warehouse_id = w.id
      AND i.product_variant_id = pv.id
  );

-- Step 6: Ensure low-stock inventory record (Variante B — quantity_on_hand <= reorder_point).
INSERT INTO inventory (
  company_id, warehouse_id, product_variant_id,
  quantity_on_hand, quantity_reserved, quantity_available,
  min_stock, max_stock, reorder_point,
  created_at, updated_at
)
SELECT
  2,
  w.id,
  pv.id,
  3.0000, 0.0000, 3.0000,
  10.0000, 200.0000, 10.0000,
  UTC_TIMESTAMP(), UTC_TIMESTAMP()
FROM warehouses w
JOIN products p ON p.company_id = 2 AND p.sku = 'DEMO-INV-PROD' AND p.deleted_at IS NULL
JOIN product_variants pv ON pv.company_id = 2 AND pv.variant_code = 'DEMO-INV-VAR-B' AND pv.deleted_at IS NULL
WHERE w.company_id = 2 AND w.code = 'DEMO-INV-WH' AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM inventory i
    WHERE i.company_id = 2
      AND i.warehouse_id = w.id
      AND i.product_variant_id = pv.id
  );
