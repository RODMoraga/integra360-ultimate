# Timezone Guide

## Objective

Standardize timestamp handling across Integra360 using this model:

- Storage and API transport: UTC
- UI presentation: America/Santiago by default
- MySQL session: `+00:00`
- Node.js runtime: `UTC`

## What was changed in code

- Backend scripts now start Node with `TZ=UTC`.
- Prisma initialization sets `SET time_zone = '+00:00'` for the application session.
- API responses serialize timestamps explicitly using ISO UTC.
- Frontend uses a shared formatter with explicit timezone.

## Pending DBA action in MySQL

The current MySQL server still reports:

- `@@global.time_zone = SYSTEM`

Recommended permanent fix:

```sql
SET GLOBAL time_zone = '+00:00';
SET PERSIST time_zone = '+00:00';
```

Verify:

```sql
SELECT NOW() AS now_local,
       UTC_TIMESTAMP() AS now_utc,
       @@session.time_zone AS session_tz,
       @@global.time_zone AS global_tz;
```

Expected after permanent fix:

- `session_tz = +00:00`
- `global_tz = +00:00`
- `NOW()` and `UTC_TIMESTAMP()` should represent the same instant

## Existing data remediation

Use:

- [backend/prisma/timezone-remediation-companies-users.sql](../backend/prisma/timezone-remediation-companies-users.sql)

Steps:

1. Backup the database.
2. Run the preview queries.
3. Validate the corrected timestamps.
4. Uncomment the transaction block and execute it.

## Frontend overrides

Optional Vite variables:

```env
VITE_APP_LOCALE=es-CL
VITE_APP_TIME_ZONE=America/Santiago
```

If not provided, those defaults are already used.
