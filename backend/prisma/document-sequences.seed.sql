-- Minimal, idempotent seed for document_sequences (company_id = 2)
-- Behavior:
-- 1) Ensures two active document types exist for demo usage.
-- 2) Ensures one or two sequence rows exist for year scope.

-- Step 1: Ensure demo document types exist (global catalog).
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
  'DEMO_GUIA',
  'Guía Demo',
  'CUSTOMER',
  1,
  0,
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM `document_types` dt
  WHERE dt.`code` = 'DEMO_GUIA'
    AND dt.`deleted_at` IS NULL
);

-- Step 2: Ensure document sequences exist for company_id = 2 and current year.
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
  101,
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
  25,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
FROM `document_types` dt
WHERE dt.`code` = 'DEMO_GUIA'
  AND dt.`deleted_at` IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `document_sequences` ds
    WHERE ds.`company_id` = 2
      AND ds.`document_type_id` = dt.`id`
      AND ds.`year_num` = YEAR(UTC_TIMESTAMP())
  )
LIMIT 1;
