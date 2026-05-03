# Inventory Historical Movements Remediation Guide

## Objective
Detect and remediate CONFIRMED inventory-affecting documents that did not generate inventory movements.

## Scope
- Database: MySQL 8+
- Tables: documents, document_details, document_types, inventory_movements, inventory_movement_types
- Focus: historical records where automation should have produced STOCK_IN or STOCK_OUT

## Script location
- backend/prisma/audit-remediate-missing-document-inventory-movements.sql

## Recommended execution flow
1. Run section A to inspect line-level findings.
2. Run section B to review summary by root cause.
3. Run section C to preview remediable rows.
4. Execute section D in a transaction only after manual review.
5. Re-run section B and confirm missing rows are resolved.

## Root cause statuses explained
- OK: movement exists as expected.
- MISSING_MOVEMENT_TYPE: required movement type code is missing in catalog.
- NO_EFFECTIVE_WAREHOUSE: neither header nor line has warehouse resolved.
- NO_MOVEMENT_REGISTERED: expected movement is absent and row is remediable if warehouse exists.

## Data integrity and transaction policy
- Always run remediation inside explicit transaction.
- Validate candidate rows before insert.
- Use idempotent inserts (script includes NOT EXISTS filters).
- Keep an export/audit snapshot before COMMIT.

## Traceability and audit
- Inserted rows are marked with reason = REMEDIATION_MISSING_DOCUMENT_MOVEMENT.
- source_document_type = DOCUMENT and source_document_id are preserved.
- This allows post-remediation tracing per document and line context.

## Post-remediation validation checklist
1. NO_MOVEMENT_REGISTERED rows reduced to zero (or expected residual).
2. NO_EFFECTIVE_WAREHOUSE rows addressed with data correction plan.
3. Stock levels reviewed for affected products/warehouses.
4. Application smoke tests executed:
   - npm run smoke:inventory:automation
5. Evidence captured in change ticket:
   - pre/post summary
   - affected document IDs
   - transaction log

## Handling NO_EFFECTIVE_WAREHOUSE residuals
Rows with NO_EFFECTIVE_WAREHOUSE require functional data correction before movement insertion. Recommended approach:
1. Define correct warehouse per document line with business owner.
2. Update document header or line warehouse data.
3. Re-run audit sections A, B, C.
4. Execute remediation section D.

## Suggested operational guardrails
- Prefer running by company_id using script variable @company_id.
- Execute first in staging, then production.
- Keep one remediation batch per company/date window to reduce rollback risk.
