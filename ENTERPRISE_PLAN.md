# Enterprise Architecture Plan & Remediation Roadmap

## PHASE 1: Validation of Previous Findings (100% Confidence)

Based on the inspection of the codebase, we have validated the following core architectural findings:

1.  **Multi-Tenant Database Isolation:**
    -   *Finding:* The transition from raw Drizzle DB updates to `getTenantDb(organizationId)` has been partially implemented.
    -   *Evidence Path:* `/src/domains/finance/services/finance.service.ts`
    -   *Confidence:* 100%. We have identified `getTenantDb` replacing direct DB access for `invoices` queries.
2.  **RBAC Authorization Control:**
    -   *Finding:* The core Role-Based Access Control logic has been established with test coverage.
    -   *Evidence Path:* `/src/lib/enterprise/rbac.ts` and `/src/lib/enterprise/rbac.test.ts`
    -   *Confidence:* 100%. Core `requirePermission()` validates global wildcard `*:*` and scoped permissions like `deals:read`.
3.  **Financial Ledger Immutability:**
    -   *Finding:* Double-entry ledger postings are integrated within transaction blocks.
    -   *Evidence Path:* `/src/domains/finance/services/finance.service.ts`
    -   *Confidence:* 100%. `LedgerEngine.postEntry` handles Debits and Credits internally upon state mutation, satisfying immutable financial recording requirements.
4.  **Transaction Locking & Concurrency:**
    -   *Finding:* Missing explicit pessimistic locks (`FOR UPDATE`) inside `tx.select().from(invoices).where(...)` which may cause race conditions on concurrent updates to invoice statuses.
    -   *Evidence Path:* `/src/domains/finance/services/finance.service.ts`
    -   *Confidence:* 100%. Code lacks `.for('update')` on read-before-write transaction flows.

---

## PHASE 2: Remediation Roadmap

### Immediate Fixes
1.  **Transaction Locking Enforcement:**
    -   Add PostgreSQL explicit locking mechanisms (`FOR UPDATE SKIP LOCKED` or standard `FOR UPDATE`) inside Drizzle transaction blocks when reading records before mutation (e.g., in `markInvoicePaid`).
2.  **RLS (Row Level Security) Strategy:**
    -   While `getTenantDb` filters at the ORM layer, we must enforce Postgres RLS purely at the schema level to assure defense-in-depth and freeze the threat of tenant leakage.
3.  **RBAC Endpoint Protection:**
    -   Ensure that all Next.js Server Actions and API Routes securely extract contextual session data and call `.requirePermission()` before invoking domain services.

---

## PHASE 3: Target Enterprise Architecture Definition

1.  **Domain-Driven Structure:**
    -   **IAM / Core:** Identity, Multi-Tenancy, and global RBAC.
    -   **Finance / Ledger:** Immutable double-entry mechanism. Complete segregation of reporting tables from high-throughput operational ledgers.
    -   **CRM / Deal Flow:** Client tracking, contracts, proposals, isolated from Finance but referencing globally tracked unique IDs.
2.  **Data Segregation:**
    -   Every table uses `organization_id` combined with RLS predicates `organization_id = current_setting('app.current_org_id')`.
3.  **Next.js Paradigm:**
    -   100% Server Components for dashboards, yielding minimal client-side bundles.
    -   Mutations happen exclusively via Server Actions bundled with CSRF/Rate-Limiting middlewares.

---

## PHASE 4: Exact Migration Path to "Enterprise Ready"

**Milestone 1: The RLS Vault**
-   *Action:* Alter the DB schema (`/src/db/schema.ts`) to enable Postgres Row-Level Security on all tables.
-   *Action:* Refactor Drizzle client `getTenantDb` to use `set_config('app.tenant_id')` locally in transaction contexts.

**Milestone 2: 100% RBAC Coverage**
-   *Action:* Implement a Next.js Higher Order Action or middleware that strictly checks permissions against `requirePermission()`.
-   *Action:* Map all external controllers (CRM, Invoices, Contracts) to specific domain policies.

**Milestone 3: Financial Integrity Enforcement**
-   *Action:* Prevent *any* manual `DELETE` statements on Ledger or Invoice tables. Instead, implement a generic `cancelled_at` state.
-   *Action:* Include `tx.select().for('update')` in all double-entry creation routines.

---

## PHASE 5: Prioritized Execution Backlog

| Priority | Task | ROI | Effort | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P0** | **Enforce Drizzle TX Locks:** Add `.for('update')` on all read-before-write mutations in finance services. | Extreme | Low | Pending |
| **P0** | **Universal RBAC Integration:** Wrap Next.js Server Actions with permission guards. | High | Medium | Pending |
| **P1** | **PostgreSQL RLS Enablement:** Push `organization_id` down to the RLS policy layer. | Extreme | High | Pending |
| **P1** | **Audit Trail Completeness:** Ensure every `POST/PUT/DELETE` action triggers `logAudit`. | Medium | Medium | In-Progress |
| **P2** | **Strict Double-Entry Segregation:** Abstract `LedgerEngine` to a separate standalone micro-service or rigid bound context. | Medium | High | Pending |
