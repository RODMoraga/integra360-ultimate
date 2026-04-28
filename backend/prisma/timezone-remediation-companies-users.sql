-- Timezone remediation for MySQL 8 / Prisma / Integra360
-- Scope: companies.created_at, companies.updated_at, users.created_at, users.updated_at, users.last_login_at
-- Goal: convert historical values recorded in server local time into UTC values before forcing UTC at runtime.
-- IMPORTANT:
-- 1. Run a backup first.
-- 2. Review the preview queries before executing the UPDATE statements.
-- 3. The offset below is calculated from the current database session.

SELECT NOW() AS db_now_local,
       UTC_TIMESTAMP() AS db_now_utc,
       TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) AS offset_seconds,
       @@session.time_zone AS session_tz,
       @@global.time_zone AS global_tz;

-- Preview current values.
SELECT id, created_at, updated_at
FROM companies
ORDER BY id DESC
LIMIT 20;

SELECT id, created_at, updated_at, last_login_at
FROM users
ORDER BY id DESC
LIMIT 20;

-- Preview converted values using the current offset.
SELECT id,
       created_at AS original_created_at,
       DATE_ADD(created_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND) AS corrected_created_at,
       updated_at AS original_updated_at,
       DATE_ADD(updated_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND) AS corrected_updated_at
FROM companies
ORDER BY id DESC
LIMIT 20;

SELECT id,
       created_at AS original_created_at,
       DATE_ADD(created_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND) AS corrected_created_at,
       updated_at AS original_updated_at,
       DATE_ADD(updated_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND) AS corrected_updated_at,
       last_login_at AS original_last_login_at,
       CASE
         WHEN last_login_at IS NULL THEN NULL
         ELSE DATE_ADD(last_login_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND)
       END AS corrected_last_login_at
FROM users
ORDER BY id DESC
LIMIT 20;

-- Execute only after validating the preview above.
-- START TRANSACTION;
--
-- UPDATE companies
-- SET created_at = DATE_ADD(created_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND),
--     updated_at = DATE_ADD(updated_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND)
-- WHERE created_at IS NOT NULL;
--
-- UPDATE users
-- SET created_at = DATE_ADD(created_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND),
--     updated_at = DATE_ADD(updated_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND),
--     last_login_at = CASE
--       WHEN last_login_at IS NULL THEN NULL
--       ELSE DATE_ADD(last_login_at, INTERVAL TIMESTAMPDIFF(SECOND, NOW(), UTC_TIMESTAMP()) SECOND)
--     END
-- WHERE created_at IS NOT NULL;
--
-- COMMIT;
