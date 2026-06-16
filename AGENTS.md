# ASAS Enterprise Governance Rules

We are building an Enterprise Real Estate Operating System capable of scaling to 100k+ customers.
You must adhere completely to the following engineering directives for all future work:

### 1. Enterprise Bounded Contexts
Never blur lines. Code must reside logically in domains:
- IAM (Authorization, Multi-tenancy)
- CRM
- Core Production / Inventory
- Finance (Ledger, Recs, Payables)
- Project & Construction
- WorkFlow & AI

### 2. Multi-tenant Database Isolation
- **Every table** containing core system data must contain an `organization_id` column.
- **Every query** must explicitly filter on `eq(table.organizationId, session.organizationId)`.

### 3. Immutable Financial Ledgers (Enterprise Standard)
Do NOT increment or decrement balances directly by calling SQL UPDATE.
- You must create a double-entry ledger system.
- To track money changing hands, insert journal entities with debits and credits.

### 4. RBAC & Security Check Strategy
- Server side operations must fetch `.requireSession()` from the enterprise auth bundle and `.requirePermission()` from the RBAC context bundle before taking action.
- Assume secure-by-default execution.

### 5. Centralized Audit Log
- Destructive updates, structural creations, and pipeline status mutations must be audited.
- Call `logAudit()` from the central security utility.

### 6. Next.js Ecosystem Optimization
- UI must remain crisp and built purely in Tailwind CSS with shadcn/lucide foundations.
- Keep Client Components at the end of the tree. Let heavily data-oriented dashboards be server components fetching data locally where possible.

Follow these strict constraints for all code updates during this Phase.
