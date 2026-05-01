-- Minimal, idempotent seed for POS terminals (company_id = 2)
-- Behavior:
-- 1) Ensures one active warehouse exists for POS terminal demo data.
-- 2) Ensures one POS terminal without dependencies (for CRUD smoke tests).
-- 3) Ensures one POS terminal with dependencies (cash register) to validate delete protection.

-- Step 1: Ensure warehouse exists.
INSERT INTO warehouses (
  company_id,
  code,
  name,
  address_line,
  commune_id,
  is_main,
  is_active,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  2,
  'DEMO-POS-WH',
  'Bodega Demo POS',
  'Bodega tecnica para terminales POS demo',
  NULL,
  0,
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM warehouses w
  WHERE w.company_id = 2
    AND w.code = 'DEMO-POS-WH'
    AND w.deleted_at IS NULL
);

-- Step 2: Ensure free terminal exists (no dependencies).
INSERT INTO pos_terminals (
  company_id,
  warehouse_id,
  code,
  name,
  device_name,
  serial_number,
  is_active,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  2,
  w.id,
  'DEMO-POS-TERM-FREE',
  'Terminal POS Demo Libre',
  'POS-DEMO-FREE-01',
  'SN-DEMO-FREE-01',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM warehouses w
WHERE w.company_id = 2
  AND w.code = 'DEMO-POS-WH'
  AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM pos_terminals pt
    WHERE pt.company_id = 2
      AND pt.code = 'DEMO-POS-TERM-FREE'
      AND pt.deleted_at IS NULL
  );

-- Step 3: Ensure locked terminal exists (will have dependencies).
INSERT INTO pos_terminals (
  company_id,
  warehouse_id,
  code,
  name,
  device_name,
  serial_number,
  is_active,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  2,
  w.id,
  'DEMO-POS-TERM-LOCK',
  'Terminal POS Demo Bloqueada',
  'POS-DEMO-LOCK-01',
  'SN-DEMO-LOCK-01',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM warehouses w
WHERE w.company_id = 2
  AND w.code = 'DEMO-POS-WH'
  AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM pos_terminals pt
    WHERE pt.company_id = 2
      AND pt.code = 'DEMO-POS-TERM-LOCK'
      AND pt.deleted_at IS NULL
  );

-- Step 4: Ensure one cash register exists linked to locked terminal.
INSERT INTO cash_registers (
  company_id,
  terminal_id,
  code,
  name,
  is_active,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  2,
  pt.id,
  'DEMO-POS-CR-LOCK',
  'Caja Demo Bloqueo POS',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM pos_terminals pt
WHERE pt.company_id = 2
  AND pt.code = 'DEMO-POS-TERM-LOCK'
  AND pt.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM cash_registers cr
    WHERE cr.company_id = 2
      AND cr.code = 'DEMO-POS-CR-LOCK'
      AND cr.deleted_at IS NULL
  );

