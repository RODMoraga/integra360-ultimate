-- Minimal, idempotent seed for digital_assets (company_id = 2)
-- Inserts two demo assets only if the same storage keys do not exist.

INSERT INTO `digital_assets` (
  `company_id`,
  `storage_disk`,
  `storage_key`,
  `original_filename`,
  `public_url`,
  `mime_type`,
  `extension`,
  `size_bytes`,
  `width_px`,
  `height_px`,
  `sha256_hash`,
  `metadata_json`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `created_by`
)
SELECT
  2,
  'local',
  'uploads/demo/catalog/product-hero-01.jpg',
  'product-hero-01.jpg',
  'https://cdn.local/demo/product-hero-01.jpg',
  'image/jpeg',
  'jpg',
  245678,
  1920,
  1080,
  'b8f96f7575f7211cac303f3117a199bd2ff8f3a5cda3649c9f4286f4f3f14f53',
  JSON_OBJECT('category', 'catalog', 'source', 'seed', 'alt', 'Producto Hero 01'),
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  2
WHERE NOT EXISTS (
  SELECT 1
  FROM `digital_assets`
  WHERE `company_id` = 2
    AND `storage_disk` = 'local'
    AND `storage_key` = 'uploads/demo/catalog/product-hero-01.jpg'
);

INSERT INTO `digital_assets` (
  `company_id`,
  `storage_disk`,
  `storage_key`,
  `original_filename`,
  `public_url`,
  `mime_type`,
  `extension`,
  `size_bytes`,
  `width_px`,
  `height_px`,
  `sha256_hash`,
  `metadata_json`,
  `is_active`,
  `created_at`,
  `updated_at`,
  `created_by`
)
SELECT
  2,
  'local',
  'uploads/demo/catalog/product-thumb-01.png',
  'product-thumb-01.png',
  'https://cdn.local/demo/product-thumb-01.png',
  'image/png',
  'png',
  84521,
  600,
  600,
  '1a8c6a5964a6a89f8f829748f4b59deebf95bc2c8df2f91fbb80f42e8e6df759',
  JSON_OBJECT('category', 'thumbnail', 'source', 'seed', 'alt', 'Miniatura Producto 01'),
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  2
WHERE NOT EXISTS (
  SELECT 1
  FROM `digital_assets`
  WHERE `company_id` = 2
    AND `storage_disk` = 'local'
    AND `storage_key` = 'uploads/demo/catalog/product-thumb-01.png'
);
