-- Minimal, idempotent seed for documents + document_details (company_id = 2)
-- Behavior:
-- 1) Ensures minimal prerequisites exist: document type/sequence, warehouse, customer, UOM, product, variant.
-- 2) Inserts one demo document if missing.
-- 3) Inserts two detail lines for that document if missing.

-- Step 1: Ensure document type exists.
INSERT INTO `document_types` (
  `code`,
  `name`,
  `counterpart_scope`,
  `affects_inventory`,
  `affects_accounting`,
  `created_at`,
  `deleted_at`
)
SELECT
  'DEMO_FACTURA',
  'Factura Demo',
  'CUSTOMER',
  0,
  1,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM `document_types` dt
  WHERE dt.`code` = 'DEMO_FACTURA'
    AND dt.`deleted_at` IS NULL
);

-- Step 2: Ensure sequence exists for current year.
INSERT INTO `document_sequences` (
  `company_id`,
  `document_type_id`,
  `year_num`,
  `next_number`,
  `created_at`,
  `updated_at`
)
SELECT
  2,
  dt.`id`,
  YEAR(UTC_TIMESTAMP()),
  1001,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
FROM `document_types` dt
WHERE dt.`code` = 'DEMO_FACTURA'
  AND dt.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `document_sequences` ds
    WHERE ds.`company_id` = 2
      AND ds.`document_type_id` = dt.`id`
      AND ds.`year_num` = YEAR(UTC_TIMESTAMP())
  )
LIMIT 1;

-- Step 3: Ensure warehouse exists.
INSERT INTO `warehouses` (
  `company_id`,
  `code`,
  `name`,
  `address_line`,
  `commune_id`,
  `is_main`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `deleted_at`
)
SELECT
  2,
  'DEMO-DOC-WH',
  'Bodega Demo Documentos',
  'Bodega técnica para semillas de documentos',
  NULL,
  1,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM `warehouses` w
  WHERE w.`company_id` = 2
    AND w.`code` = 'DEMO-DOC-WH'
    AND w.`deleted_at` IS NULL
);

-- Step 4: Ensure customer exists.
INSERT INTO `customers` (
  `company_id`,
  `code`,
  `tax_id`,
  `legal_name`,
  `business_activity`,
  `email`,
  `phone`,
  `address_line`,
  `commune_id`,
  `payment_terms_days`,
  `credit_limit`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `deleted_at`
)
SELECT
  2,
  'DEMO-CUST-DOC',
  '76000001-5',
  'Cliente Demo Documentos SPA',
  'Comercio General',
  'cliente.demo.docs@integra360.local',
  '+56990001111',
  'Av. Demo 123',
  NULL,
  30,
  1000000.0000,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM `customers` c
  WHERE c.`company_id` = 2
    AND c.`code` = 'DEMO-CUST-DOC'
    AND c.`deleted_at` IS NULL
);

-- Step 5: Ensure base UOM exists.
INSERT INTO `units_of_measure` (
  `company_id`,
  `code`,
  `name`,
  `symbol`,
  `unit_type`,
  `is_base_unit`,
  `created_at`,
  `updated_at`,
  `deleted_at`
)
SELECT
  2,
  'UN',
  'Unidad',
  'un',
  'count',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM `units_of_measure` u
  WHERE u.`company_id` = 2
    AND u.`code` = 'UN'
    AND u.`deleted_at` IS NULL
);

-- Step 6: Ensure product exists.
INSERT INTO `products` (
  `company_id`,
  `sku`,
  `barcode`,
  `name`,
  `description`,
  `base_uom_id`,
  `tax_rate`,
  `cost_price`,
  `sale_price`,
  `track_inventory`,
  `min_stock`,
  `is_service`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `deleted_at`,
  `created_by`
)
SELECT
  2,
  'DEMO-DOC-PROD-001',
  '7800000001001',
  'Producto Demo Documento',
  'Producto para validar documento con detalle',
  u.`id`,
  0.1900,
  7000.0000,
  15990.0000,
  1,
  0.0000,
  0,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL,
  2
FROM `units_of_measure` u
WHERE u.`company_id` = 2
  AND u.`code` = 'UN'
  AND u.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `products` p
    WHERE p.`company_id` = 2
      AND p.`sku` = 'DEMO-DOC-PROD-001'
      AND p.`deleted_at` IS NULL
  )
LIMIT 1;

-- Step 7: Ensure product variant exists.
INSERT INTO `product_variants` (
  `company_id`,
  `product_id`,
  `variant_code`,
  `name`,
  `attributes_json`,
  `sku`,
  `barcode`,
  `cost_price`,
  `sale_price`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `deleted_at`
)
SELECT
  2,
  p.`id`,
  'DEMO-DOC-VAR-001',
  'Variante Demo Documento',
  JSON_OBJECT('origen', 'seed', 'uso', 'document_detail'),
  'DEMO-DOC-VAR-001',
  '7800000002002',
  7000.0000,
  15990.0000,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM `products` p
WHERE p.`company_id` = 2
  AND p.`sku` = 'DEMO-DOC-PROD-001'
  AND p.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `product_variants` pv
    WHERE pv.`company_id` = 2
      AND pv.`variant_code` = 'DEMO-DOC-VAR-001'
      AND pv.`deleted_at` IS NULL
  )
LIMIT 1;

-- Step 8: Insert demo document if missing.
INSERT INTO `documents` (
  `company_id`,
  `document_type_id`,
  `sequence_number`,
  `document_date`,
  `warehouse_id`,
  `customer_id`,
  `supplier_id`,
  `status`,
  `subtotal`,
  `tax_total`,
  `discount_total`,
  `total`,
  `notes`,
  `confirmed_at`,
  `created_at`,
  `updated_at`,
  `deleted_at`,
  `created_by`
)
SELECT
  2,
  dt.`id`,
  9001,
  UTC_TIMESTAMP(),
  w.`id`,
  c.`id`,
  NULL,
  'CONFIRMED',
  40970.0000,
  4586.0000,
  500.0000,
  45056.0000,
  'Documento demo generado por seed documents.seed.sql',
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL,
  (
    SELECT MIN(u.`id`)
    FROM `users` u
    WHERE u.`company_id` = 2
      AND u.`deleted_at` IS NULL
  )
FROM `document_types` dt
INNER JOIN `warehouses` w
  ON w.`company_id` = 2
 AND w.`code` = 'DEMO-DOC-WH'
 AND w.`deleted_at` IS NULL
INNER JOIN `customers` c
  ON c.`company_id` = 2
 AND c.`code` = 'DEMO-CUST-DOC'
 AND c.`deleted_at` IS NULL
WHERE dt.`code` = 'DEMO_FACTURA'
  AND dt.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `documents` d
    WHERE d.`company_id` = 2
      AND d.`document_type_id` = dt.`id`
      AND d.`sequence_number` = 9001
      AND d.`deleted_at` IS NULL
  )
LIMIT 1;

-- Step 9: Insert first detail line if missing.
INSERT INTO `document_details` (
  `company_id`,
  `document_id`,
  `line_number`,
  `product_variant_id`,
  `warehouse_id`,
  `quantity`,
  `unit_price`,
  `discount_amount`,
  `tax_amount`,
  `line_total`,
  `created_at`,
  `updated_at`
)
SELECT
  2,
  d.`id`,
  1,
  pv.`id`,
  d.`warehouse_id`,
  2.0000,
  15990.0000,
  500.0000,
  2878.0000,
  34358.0000,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
FROM `documents` d
INNER JOIN `document_types` dt
  ON dt.`id` = d.`document_type_id`
INNER JOIN `product_variants` pv
  ON pv.`company_id` = 2
 AND pv.`variant_code` = 'DEMO-DOC-VAR-001'
 AND pv.`deleted_at` IS NULL
WHERE d.`company_id` = 2
  AND dt.`code` = 'DEMO_FACTURA'
  AND d.`sequence_number` = 9001
  AND d.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `document_details` dd
    WHERE dd.`document_id` = d.`id`
      AND dd.`line_number` = 1
  )
LIMIT 1;

-- Step 10: Insert second detail line if missing.
INSERT INTO `document_details` (
  `company_id`,
  `document_id`,
  `line_number`,
  `product_variant_id`,
  `warehouse_id`,
  `quantity`,
  `unit_price`,
  `discount_amount`,
  `tax_amount`,
  `line_total`,
  `created_at`,
  `updated_at`
)
SELECT
  2,
  d.`id`,
  2,
  pv.`id`,
  d.`warehouse_id`,
  1.0000,
  8990.0000,
  0.0000,
  1708.0000,
  10698.0000,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
FROM `documents` d
INNER JOIN `document_types` dt
  ON dt.`id` = d.`document_type_id`
INNER JOIN `product_variants` pv
  ON pv.`company_id` = 2
 AND pv.`variant_code` = 'DEMO-DOC-VAR-001'
 AND pv.`deleted_at` IS NULL
WHERE d.`company_id` = 2
  AND dt.`code` = 'DEMO_FACTURA'
  AND d.`sequence_number` = 9001
  AND d.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `document_details` dd
    WHERE dd.`document_id` = d.`id`
      AND dd.`line_number` = 2
  )
LIMIT 1;
