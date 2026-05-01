-- Minimal, idempotent seed for cash registers (company_id = 2)
-- Behavior:
-- 1) Ensures one active warehouse and POS terminal exist as prerequisites.
-- 2) Ensures one cash register without openings (FREE) for CRUD smoke tests.
-- 3) Ensures one cash register with one opening (LOCK) to validate delete protection.

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
  'DEMO-CASH-WH',
  'Bodega Demo Cajas',
  'Bodega tecnica para cajas demo',
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
    AND w.code = 'DEMO-CASH-WH'
    AND w.deleted_at IS NULL
);

-- Step 2: Ensure terminal exists.
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
  'DEMO-CASH-TERM',
  'Terminal Demo Cajas',
  'POS-CASH-DEMO-01',
  'SN-CASH-DEMO-01',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM warehouses w
WHERE w.company_id = 2
  AND w.code = 'DEMO-CASH-WH'
  AND w.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM pos_terminals pt
    WHERE pt.company_id = 2
      AND pt.code = 'DEMO-CASH-TERM'
      AND pt.deleted_at IS NULL
  );

-- Step 3: Ensure free cash register exists.
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
  'DEMO-CASH-REG-FREE',
  'Caja Demo Libre',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM pos_terminals pt
WHERE pt.company_id = 2
  AND pt.code = 'DEMO-CASH-TERM'
  AND pt.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM cash_registers cr
    WHERE cr.company_id = 2
      AND cr.code = 'DEMO-CASH-REG-FREE'
      AND cr.deleted_at IS NULL
  );

-- Step 4: Ensure locked cash register exists.
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
  'DEMO-CASH-REG-LOCK',
  'Caja Demo Bloqueada',
  1,
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP(),
  NULL
FROM pos_terminals pt
WHERE pt.company_id = 2
  AND pt.code = 'DEMO-CASH-TERM'
  AND pt.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM cash_registers cr
    WHERE cr.company_id = 2
      AND cr.code = 'DEMO-CASH-REG-LOCK'
      AND cr.deleted_at IS NULL
  );

-- Step 5: Ensure one opening exists for locked register.
INSERT INTO cash_openings (
  company_id,
  cash_register_id,
  user_id,
  opened_at,
  opening_amount,
  note,
  status,
  created_at,
  updated_at
)
SELECT
  2,
  cr.id,
  seed_user.id,
  UTC_TIMESTAMP(),
  10000.0000,
  'Apertura seed para bloqueo de eliminacion de caja',
  'OPEN',
  UTC_TIMESTAMP(),
  UTC_TIMESTAMP()
FROM cash_registers cr
JOIN (
  SELECT MIN(u.id) AS id
  FROM users u
  WHERE u.company_id = 2
    AND u.is_active = 1
) seed_user ON seed_user.id IS NOT NULL
WHERE cr.company_id = 2
  AND cr.code = 'DEMO-CASH-REG-LOCK'
  AND cr.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM cash_openings co
    WHERE co.company_id = 2
      AND co.cash_register_id = cr.id
  );
