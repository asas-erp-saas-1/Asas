# ASAS REAL ESTATE OPERATING SYSTEM
## ENTERPRISE DATA MODEL V1

*Prepared by: Chief Data Architect / Principal Database Engineer*

---

## PART 1: COMPLETE DOMAIN MAP

### 1. IAM & Organizations
*   **Purpose**: Manages multi-tenancy, identity, access control, and organizational structures.
*   **Responsibilities**: Authentication, Authorization, Tenant isolation, Role-based access control (RBAC).
*   **Core Entities**: Organization, User, Role, Permission, Session.
*   **Ownership Boundaries**: Owns all identity and access data. Never depends on other domains.
*   **External Dependencies**: None.

### 2. CRM & Marketing
*   **Purpose**: Manages customer lifecycle, lead acquisition, and marketing attribution.
*   **Responsibilities**: Lead routing, campaign tracking, interaction logs, sales pipeline tracking.
*   **Core Entities**: Contact, Lead, Campaign, Interaction, Opportunity.
*   **Ownership Boundaries**: Owns customer interactions before a firm reservation.
*   **External Dependencies**: Depends on IAM.

### 3. Projects, Buildings, Properties, Units & Inventory
*   **Purpose**: Manages the core real estate physical and abstract assets.
*   **Responsibilities**: Project lifecycle, construction tracking, building structures, unit inventory, pricing, availability matching.
*   **Core Entities**: Project, Building, Property, Unit (Inventory Item), Floorplan.
*   **Ownership Boundaries**: Owns all physical asset metadata and availability state.
*   **External Dependencies**: Depends on IAM.

### 4. Reservations, Contracts & Operations
*   **Purpose**: Manages the conversion of an inventory item to a sold asset.
*   **Responsibilities**: Unit locking, deposit tracking, VSP (Vente sur Plan) lifecycle, contract signing.
*   **Core Entities**: Reservation, Contract, Buyer_Profile.
*   **Ownership Boundaries**: Owns the legal transaction state.
*   **External Dependencies**: Depends on IAM, CRM (Contact), Inventory (Unit).

### 5. Finance, Accounting, Installments & Payments
*   **Purpose**: Manages all monetary transactions, ledgers, and revenue tracking.
*   **Responsibilities**: Accounts receivable/payable, double-entry bookkeeping, commission calculation, installment schedules.
*   **Core Entities**: Account, Journal_Entry, Ledger_Line, Invoice, Payment, Installment, Commission.
*   **Ownership Boundaries**: Owns all financial truth. Immutable.
*   **External Dependencies**: Depends on IAM, Contracts (for billing schedules).

### 6. Documents
*   **Purpose**: Manages files, templates, and generated paperwork.
*   **Responsibilities**: Storage pointers, versioning, e-signatures.
*   **Core Entities**: Document, Template, Signature.
*   **Ownership Boundaries**: Owns file metadata via pointers.
*   **External Dependencies**: Depends on IAM.

### 7. Workflows, Notifications & Audit
*   **Purpose**: Manages system orchestration, alerts, and security trails.
*   **Responsibilities**: Rule evaluations, background jobs, immutable security logs.
*   **Core Entities**: Workflow_Rule, Job, Notification, Audit_Log, Webhook.
*   **Ownership Boundaries**: Global cross-cutting concern.
*   **External Dependencies**: Depends on all domains for event inputs.

### 8. AI & Reporting
*   **Purpose**: Drives operational intelligence and predictive analytics.
*   **Responsibilities**: Vector embeddings, forecasting dashboards, cached metrics.
*   **Core Entities**: Embedding, Report_Cache, Dashboard_Config.
*   **Ownership Boundaries**: Purely analytical; read-only access to core domains.
*   **External Dependencies**: Depends on all core operational domains.

### 9. Human Resources & Support
*   **Purpose**: Manages employee data, performance, and customer support tickets.
*   **Responsibilities**: HR profiles, payroll linking, ticket resolution.
*   **Core Entities**: Employee, Department, Ticket, Ticket_Message.
*   **Ownership Boundaries**: Employee identity extensions and post-sales support.
*   **External Dependencies**: Depends on IAM.

---

## PART 2: MASTER ENTITY CATALOG

1.  **Organization**: Tenant isolation root. (IAM) - Critical
2.  **User**: System accessor. (IAM) - Critical
3.  **Role**: RBAC definition. (IAM) - High
4.  **Permission**: Granular access flag. (IAM) - High
5.  **Contact**: Universal human/business entity. (CRM) - Critical
6.  **Lead**: Potential buyer. (CRM) - High
7.  **Interaction**: Logged activity. (CRM) - Medium
8.  **Project**: Master development. (Inventory) - Critical
9.  **Building**: Structure within project. (Inventory) - High
10. **Unit**: Sellable inventory item. (Inventory) - Critical
11. **Reservation**: Temporary lock on Unit. (Operations) - Critical
12. **Contract**: Binding legal agreement. (Operations) - Critical
13. **Installment**: Scheduled expected payment. (Finance) - Critical
14. **Invoice**: Billed request for funds. (Finance) - High
15. **Payment**: Actual received funds. (Finance) - Critical
16. **Account**: Chart of Accounts node. (Finance) - Critical
17. **Journal_Entry**: Financial transaction grouping. (Finance) - Critical
18. **Ledger_Line**: Individual debit/credit. (Finance) - Critical
19. **Commission**: Computed broker fee. (Finance) - Medium
20. **Document**: File pointer/version. (Documents) - High
21. **Audit_Log**: Immutable trail. (Audit) - Critical
22. **Workflow_Rule**: Automation logic. (Workflow) - High

---

## PART 3: COMPLETE ERD

```text
Organization
├── Users
│   └── Roles
│       └── Permissions
├── Contacts (CRM)
│   ├── Leads
│   └── Interactions
├── Projects (Inventory)
│   └── Buildings
│       └── Units
├── Contracts (Operations)
│   ├── Reservations
│   └── Documents
└── Finance (Enterprise Core)
    ├── Accounts (Chart of Accounts)
    └── Journal_Entries
        └── Ledger_Lines

Cross-Domain Relationships:
Unit -> 1:M -> Reservations
Unit -> 1:1 -> Contract (Active)
Contact -> 1:M -> Reservations
Contract -> 1:M -> Installments
Contract -> 1:M -> Invoices
Invoice -> 1:M -> Payments
Payment -> 1:1 -> Journal_Entry
User -> 1:M -> Interactions
User -> 1:M -> Audit_Logs
```

---

## PART 4: DATABASE SCHEMA OWNERSHIP

Logical Schemas (simulated via prefix or logical grouping in standard public Postgres schema for Drizzle compatibility, or true Postgres schemas if required by DBA).

*   `iam.*`: Organizations, Users, Roles, Permissions. (Owner: Security Team)
*   `crm.*`: Contacts, Leads, Interactions, Campaigns. (Owner: Sales Ops)
*   `inventory.*`: Projects, Buildings, Units. (Owner: Production/Asset Ops)
*   `operations.*`: Reservations, Contracts. (Owner: Legal/Sales)
*   `finance.*`: Accounts, Journal Entries, Ledger Lines, Invoices, Payments, Installments. (Owner: CFO/Finance)
*   `documents.*`: Documents, Signatures. (Owner: Compliance)
*   `system.*`: Audit Logs, Workflows, Notifications. (Owner: Core Engineering)

---

## PART 5: DATA DICTIONARY

*Sample of Critical Entities. Note: All tables must contain `organization_id` except the `organizations` table itself.*

### Entity: Unit (inventory.units)
*   **Purpose**: The core sellable asset.
*   **PK**: `id` (UUID)
*   **FKs**: `organization_id` (organizations.id), `building_id` (inventory.buildings)
*   **Required Columns**: `reference_code` (VARCHAR), `status` (ENUM: available, reserved, sold, blocked), `floor` (INT), `area_sqm` (DECIMAL), `base_price` (DECIMAL)
*   **Optional Columns**: `metadata` (JSONB for custom features)
*   **Indexes**: `idx_unit_org_status`, `idx_unit_reference`

### Entity: Contract (operations.contracts)
*   **Purpose**: The agreed sale.
*   **PK**: `id` (UUID)
*   **FKs**: `organization_id`, `unit_id`, `contact_id`
*   **Required Columns**: `reference_code`, `status` (ENUM: draft, signed, cancelled), `agreed_price` (DECIMAL), `signed_date` (TIMESTAMP)
*   **Indexes**: `idx_contract_org_status`, `idx_contract_unit`

### Entity: Ledger_Line (finance.ledger_lines)
*   **Purpose**: Immutable financial accounting.
*   **PK**: `id` (UUID)
*   **FKs**: `organization_id`, `journal_entry_id`, `account_id`
*   **Required Columns**: `direction` (ENUM: debit, credit), `amount` (DECIMAL), `currency` (VARCHAR), `created_at` (TIMESTAMP)
*   **Constraints**: `amount > 0` (No negative values; reversals use opposite direction entries).

---

## PART 6: MULTI-TENANCY STRATEGY

*   **Architecture**: Shared Database, Isolated Schema/Rows (Pool-based Multi-tenancy).
*   **Core Rule**: Every table (except `organizations` and global lookup tables like `currencies` or `countries`) **MUST** include an `organization_id` column.
*   **Enforcement**:
    *   Application Layer: All ORM queries append `.where(eq(table.organizationId, session.organizationId))` automatically via standard wrappers.
    *   Database Layer: Row-Level Security (RLS) policies enforcing `organization_id = current_setting('app.current_tenant_id')`.
*   **Global Tables**: `organizations`, `system_plans`, `global_features`.

---

## PART 7: AUDIT STRATEGY

*   **Audit Tables**: Centralized `audit_logs` table (Append-only).
*   **Event Tracking**: Captures `actor_id` (User), `action` (CREATE/UPDATE/DELETE), `entity_type` (e.g., 'invoice'), `entity_id`, `ip_address`.
*   **Payloads**: Uses `JSONB` for `old_data` and `new_data`.
*   **Immutable History**: `audit_logs` table has NO UPDATE or DELETE triggers. Database level DENY rules for modification.
*   **Mandatory Auditing**: Financial operations, Contract status changes, User role changes, Unit status changes.
*   **Never Delete**: Invoices, Contracts, Units, Users, Payments (Use `deleted_at` soft-deletes).

---

## PART 8: FINANCIAL DATA MODEL

**Rule: No Balance Columns. Ledger Driven Only.**

1.  **Chart of Accounts** (`finance.accounts`): Hierarchical nodes (Assets, Liabilities, Equity, Revenue, Expenses).
2.  **Journal Entries** (`finance.journal_entries`): Transaction grouping with date, description, and source reference (e.g., Payment ID).
3.  **Ledger Lines** (`finance.ledger_lines`): The fundamental truth. Debits and Credits appended here.
4.  **Installments** (`finance.installments`): Expected forward-looking cash flows. Do not affect ledger until paid.
5.  **Invoices** (`finance.invoices`): Billed obligations. Generates a Journal Entry (Debit AR, Credit Revenue).
6.  **Payments** (`finance.payments`): Reconciled receipts. Generates a Journal Entry (Debit Cash, Credit AR).

---

## PART 9: EVENT SOURCING STRATEGY

Certain domains will emit domain events to an enterprise bus for decoupled processing.

*   `iam`
    *   `user.created`, `user.role_changed`
*   `crm`
    *   `lead.qualified`, `interaction.logged`
*   `inventory`
    *   `unit.status_changed`
*   `operations`
    *   `reservation.created`, `reservation.expired`
    *   `contract.signed`, `contract.cancelled` -> Consumers: Finance (creates installments/invoices)
*   `finance`
    *   `payment.received`, `payment.failed` -> Consumers: Operations (updates contract risk), Notification (emails client)
    *   `installment.overdue`

---

## PART 10: MIGRATION DEPENDENCY GRAPH

Strict deployment order for schema creation:

1.  **Foundation**: `organizations`
2.  **IAM**: `roles`, `users`, `permissions`
3.  **CRM**: `contacts`, `leads`, `interactions`
4.  **Inventory**: `projects`, `buildings`, `units`
5.  **Operations**: `reservations`, `contracts`
6.  **Finance Core**: `accounts`, `journal_entries`, `ledger_lines`
7.  **Finance Billing**: `invoices`, `installments`, `payments`, `commissions`
8.  **Documents**: `documents`, `signatures`
9.  **System**: `workflow_rules`, `audit_logs`, `notifications`
10. **Analytics**: `report_caches`, `pgvector_embeddings` (AI)

---

## PART 11: SUPABASE READINESS REVIEW

*   **PostgreSQL Compatibility**: 100% compliant. Heavily relies on standard PG features.
*   **Supabase Compatibility**: Fully aligned. Supabase Auth can link to our IAM schema.
*   **RLS Compatibility**: High. The explicit `organization_id` matches perfectly with Supabase's standard RLS implementation for SaaS.
*   **pgvector**: Supabase native support available. Embedding tables can be created safely.
*   **Migrations**: Drizzle ORM migration files can be executed directly against Supabase databases via CI/CD.

---

## PART 12: FINAL APPROVAL PACKAGE

This document constitutes the **Final Database Blueprint**.

By approving this model, all development teams agree that:
1. No schema may break the Migration Dependency Graph.
2. No table holding tenant data may omit `organization_id`.
3. Financial balances MUST be calculated dynamically from `ledger_lines`; caching aggregate materialized views is permitted, but literal balance columns in standard transactional tables are forbidden.
4. Data deletion for core business entities MUST be implemented via `deleted_at` (soft deletes).

**Status: READY FOR ENGINEERING IMPLEMENTATION PHASES.**
