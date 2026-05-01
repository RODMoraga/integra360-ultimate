-- Minimal, idempotent seed to create product_images relations for digital_assets tests.
-- Scope: company_id = 2
-- Behavior:
-- 1) Ensures a base unit of measure exists.
-- 2) Creates one demo product if missing.
-- 3) Links two seeded digital assets to that product as gallery images.

-- Step 1: Ensure base unit of measure exists for company 2.
INSERT INTO `units_of_measure` (
  `company_id`,
  `code`,
  `name`,
  `symbol`,
  `unit_type`,
  `is_base_unit`,
  `created_at`,
  `updated_at`
)
SELECT
  2,
  'UN',
  'Unidad',
  'un',
  'count',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
WHERE NOT EXISTS (
  SELECT 1
  FROM `units_of_measure` u
  WHERE u.`company_id` = 2
    AND u.`deleted_at` IS NULL
);

-- Step 2: Ensure demo product exists.
INSERT INTO `products` (
  `company_id`,
  `sku`,
  `name`,
  `base_uom_id`,
  `description`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `created_by`
)
SELECT
  2,
  'DEMO-DA-001',
  'Producto Demo Activos Digitales',
  u.`id`,
  'Producto técnico para validar dependencias de activos digitales',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  2
FROM `units_of_measure` u
WHERE u.`company_id` = 2
  AND u.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `products` p
    WHERE p.`company_id` = 2
      AND p.`sku` = 'DEMO-DA-001'
      AND p.`deleted_at` IS NULL
  )
ORDER BY u.`id` ASC
LIMIT 1;

-- Step 3: Link first digital asset to demo product.
INSERT INTO `product_images` (
  `company_id`,
  `product_id`,
  `asset_id`,
  `purpose`,
  `alt_text`,
  `sort_order`,
  `is_primary`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `created_by`,
  `primary_product_id`
)
SELECT
  2,
  p.`id`,
  a.`id`,
  'GALLERY',
  'Imagen demo vinculada (hero)',
  COALESCE((
    SELECT MAX(pi.`sort_order`)
    FROM `product_images` pi
    WHERE pi.`company_id` = 2
      AND pi.`product_id` = p.`id`
      AND pi.`deleted_at` IS NULL
  ), 0) + 1,
  0,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  2,
  NULL
FROM `products` p
INNER JOIN `digital_assets` a
  ON a.`company_id` = 2
 AND a.`storage_disk` = 'local'
 AND a.`storage_key` = 'uploads/demo/catalog/product-hero-01.jpg'
 AND a.`deleted_at` IS NULL
WHERE p.`company_id` = 2
  AND p.`sku` = 'DEMO-DA-001'
  AND p.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `product_images` pi
    WHERE pi.`company_id` = 2
      AND pi.`product_id` = p.`id`
      AND pi.`asset_id` = a.`id`
      AND pi.`deleted_at` IS NULL
  )
LIMIT 1;

-- Step 4: Link second digital asset to demo product.
INSERT INTO `product_images` (
  `company_id`,
  `product_id`,
  `asset_id`,
  `purpose`,
  `alt_text`,
  `sort_order`,
  `is_primary`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `created_by`,
  `primary_product_id`
)
SELECT
  2,
  p.`id`,
  a.`id`,
  'GALLERY',
  'Imagen demo vinculada (thumb)',
  COALESCE((
    SELECT MAX(pi.`sort_order`)
    FROM `product_images` pi
    WHERE pi.`company_id` = 2
      AND pi.`product_id` = p.`id`
      AND pi.`deleted_at` IS NULL
  ), 0) + 1,
  0,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  2,
  NULL
FROM `products` p
INNER JOIN `digital_assets` a
  ON a.`company_id` = 2
 AND a.`storage_disk` = 'local'
 AND a.`storage_key` = 'uploads/demo/catalog/product-thumb-01.png'
 AND a.`deleted_at` IS NULL
WHERE p.`company_id` = 2
  AND p.`sku` = 'DEMO-DA-001'
  AND p.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `product_images` pi
    WHERE pi.`company_id` = 2
      AND pi.`product_id` = p.`id`
      AND pi.`asset_id` = a.`id`
      AND pi.`deleted_at` IS NULL
  )
LIMIT 1;
