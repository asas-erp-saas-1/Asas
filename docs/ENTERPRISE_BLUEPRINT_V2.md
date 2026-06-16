# ASAS REAL ESTATE OPERATING SYSTEM
## ENTERPRISE TRANSFORMATION MASTER DIRECTIVE V2

*Prepared by: Chief Enterprise Architect / CTO*

---

## PART 1: TARGET ENTERPRISE ARCHITECTURE

### 1.1 Architecture Blueprint
ASAS will transition from a monolithic prototype to a **Modular Enterprise Monolith** (with logical boundaries) preparing for microservices at scale.

*   **Frontend**: Next.js App Router (React 15+), Server Components default, Tailwind CSS, shadcn/ui.
*   **Backend**: Next.js API Routes / Server Actions orchestrating Domain Services.
*   **Database**: PostgreSQL (Cloud SQL/Neon) with Row-Level Security (RLS) for multi-tenancy.
*   **API Architecture**: REST semantics internally with typed tRPC/Server Actions for frontend-backend communication.
*   **Event Architecture**: Centralized Event Bus (Pub/Sub pattern) to decouple domains (e.g., `deal.won` triggers `invoice.create`).

### 1.2 System Boundaries & Flow
```text
[ Client (Web/Mobile) ]
          |
    [ Edge Network / WAF ]
          |
[ Load Balancer & API Gateway ]
          |
[ Next.js Application Server ]
  ├─ IAM & Security Layer
  ├─ API Route Handlers
  ├─ Domain Services (CRM, ERP, Projects)
  └─ Workflow Automation Engine
          |
[ Persistence & Data Layer ]
  ├─ Primary DB (PostgreSQL / Drizzle ORM)
  ├─ Search/Cache (Redis)
  ├─ Document Store (S3/Cloud Storage)
  └─ Vector DB (pgvector for AI context)
```

---

## PART 2: DOMAIN DRIVEN DESIGN (DDD)

### Bounded Contexts
1.  **IAM (Identity & Access Management)**: Users, Roles, Permissions (RBAC/ABAC), Tenants, Sessions.
2.  **CRM & Marketing**: Leads, Campaigns, Pipelines, Interactions, Scoring.
3.  **Projects & Construction**: Projects, Phases, Tasks, Milestones, Delays, Inventory.
4.  **Sales & Core**: Reservations, Contracts, Installment schedules.
5.  **Finance & ERP**: General Ledger, Accounts Receivable/Payable, Invoices, Receipts, Commissions.
6.  **Documents**: Templates, Generation, Signatures, Versioning.
7.  **Automation & Workflow**: Triggers, Rules, Executions.
8.  **AI & Analytics**: Copilot, Forecasting, Operational Health.

---

## PART 3: DATABASE TRANSFORMATION PLAN

### 3.1 Advanced Schema Strategy
*   **Multi-tenancy**: Hard isolated via `organization_id` on every table, enforced via Drizzle ORM extensions or Postgres RLS.
*   **Financial Integrity**: Append-only General Ledger tables (`journal_entries`, `ledger_lines`). No `UPDATE` or `DELETE` on financial records.
*   **Temporal History**: Soft deletes (`deleted_at`) for standard records, shadow history tables for critical entities (`contracts_history`).
*   **Audit**: Dedicated `audit_logs` table tracking `organization_id`, `user_id`, `action`, `resource`, `old_payload`, `new_payload`.

### 3.2 Migration Roadmap
1.  Introduce `organizations` and `organization_id` foreign keys (Completed in current phase).
2.  Deploy RLS policies across all tables.
3.  Refactor `deals` table to link explicitly to `inventory_items` rather than abstract properties.
4.  Implement Ledger structure.

---

## PART 4: WORKFLOW ENGINE DESIGN

### 4.1 Orchestration Model
An Event-Driven Workflow Engine running asynchronously.
*   **Triggers**: Webhooks, Cron, Entity State Changes (e.g., `Reservation Status -> Signed`).
*   **Conditions**: JSON-encoded rule evaluations (e.g., `Deal Amount > 5M DA`).
*   **Actions**: Send Email, Update Entity, Generate Document, Assign Task.

### 4.2 Execution Architecture
*   **Event Bus**: Emits events to a Background Queue (e.g., Redis/Upstash).
*   **Workers**: Consume events, evaluate Workflow Rules, execute Actions.
*   **Audit**: Every workflow execution creates a `workflow_logs` record for tracing.

---

## PART 5: REAL ESTATE CORE ENGINE

### 5.1 Lifecycle State Machine
```text
[LEAD] -> (Marketing qualifies) -> [MQL] -> (Sales qualifies) -> [SQL]
   |
[VISIT] -> (Client inspects property)
   |
[NEGOTIATION] -> (Terms discussed)
   |
[RESERVATION] -> (Deposit paid, Unit locked)
   |
[CONTRACT] -> (VSP Generated, Signed)
   |
[INSTALLMENTS] -> (Scheduled payments tracked via Finance Engine)
   |
[HANDOVER] -> (Keys delivered, Warranty period starts)
```
### 5.2 Automations
*   *If Reservation expires without deposit -> Auto-unlock Unit.*
*   *If Installment is 5 days late -> Auto-trigger automated SMS/Email reminder.*

---

## PART 6: FINANCE ERP ENGINE

### 6.1 Ledger-Driven Architecture
ASAS must use double-entry bookkeeping principles.
*   **Entities**: `accounts` (Chart of Accounts), `journal_entries`, `ledger_lines`.
*   **Receivables**: Client signs a contract of 10M DA.
    *   *Debit*: Accounts Receivable (10M)
    *   *Credit*: Unearned Revenue (10M)
*   **Receipts**: Client pays 2M DA.
    *   *Debit*: Cash (2M)
    *   *Credit*: Accounts Receivable (2M)

No arbitrary "update balance" operations. Dashboards sum ledger entries.

---

## PART 7: DOCUMENT MANAGEMENT SYSTEM

### 7.1 Storage & Pipeline
*   **Storage**: Cloud Object Storage (S3 / Google Cloud Storage) partitioned by `organization_id/project_id/`.
*   **Generation**: HTML-to-PDF microservice for dynamically generating VSPs (Ventes sur Plans) with populated CRM data.
*   **Versioning**: Immutable document IDs. Updates create a new version record.

---

## PART 8: AI OPERATING LAYER

### 8.1 Enterprise AI Topology
*   **Data Foundation**: Daily CDC (Change Data Capture) from Postgres to an Analytical Store / Vector DB (`pgvector`).
*   **Models**: Gemini 1.5 Pro / Flash for complex reasoning and Copilot chat.
*   **Capabilities**:
    *   *Risk Prediction*: Analyze weather delays, supplier history, and project tasks to flag at-risk construction milestones.
    *   *Lead Scoring*: Predict conversion likelihood based on interaction frequency and source footprint.
    *   *Semantic Search*: "Show me all 3-bedroom units in Oran available under 15M DA."

---

## PART 9: PERFORMANCE & SCALE PLAN

### 9.1 Scaling Strategy for 100k+ Users
*   **Caching Layer**: Implement aggressive Radix/Redis caching for read-heavy operations (e.g., Global Dashboards, Inventory listings).
*   **Database Scaling**: Connection pooling (PgBouncer). Read replicas for analytics/reporting queries to protect the write primary.
*   **Frontend**: Leverage Next.js Static Rendering & ISR for public-facing portals, standard Server Components for protected routes.

---

## PART 10: SECURITY BLUEPRINT

### 10.1 Security Maturity Matrix
*   **Level 1 (Current)**: Basic Auth, Simple Role checks, basic API guards.
*   **Level 2**: Strict RBAC, `organization_id` on all tables, Audit Logging (Added).
*   **Level 3**: MFA enforcement, Row-Level Security (RLS) in database, automated vulnerability scanning.
*   **Level 4**: Attribute-Based Access Control (ABAC - "Manager can only see region X"), API rate limiting.
*   **Level 5 (Target)**: SOC2/ISO27001 readiness, Data Encryption at Rest with Customer Managed Keys (CMK), Zero-Trust Architecture.

---

## PART 11: UI/UX TRANSFORMATION

### 11.1 Enterprise UX Paradigms
*   **Global Navigation**: Collapsible side-nav organized by Domain (CRM, Projects, Finance, Settings).
*   **Density Controls**: Allow users to toggle "Comfortable" vs "Compact" table layouts for heavy data entry.
*   **Command Palette (Cmd+K)**: Global search for Deals, Clients, and Actions.
*   **Slide-outs & Drawers**: Prevent contextual loss. Editing a deal should slide a panel over the list, not redirect the page entirely.

---

## PART 12: IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Months 1-2)
*   **Goal**: Solidify IAM, Multi-tenancy, RBAC, and Database schemas. Apply uniform UI tokens.
### Phase 2: CRM & Inventory Core (Months 3-4)
*   **Goal**: Lead-to-Reservation lifecycle, Unit locking, Client Profiles.
### Phase 3: Finance ERP (Months 5-6)
*   **Goal**: Double-entry ledger, invoicing, payment tracking, commission engine.
### Phase 4: Project Management & Construction (Months 7-8)
*   **Goal**: Milestones, task tracking, risk logging, supplier management.
### Phase 5: Workflow Automation (Months 9-10)
*   **Goal**: Event bus, rule engine, automated notifications.
### Phase 6: AI & Executive Intelligence (Months 11-12)
*   **Goal**: Copilot, forecasting grids, semantic search.

---

## PART 13: DEVELOPMENT GOVERNANCE

### 13.1 Mandatory Rules
1.  **Architecture**: All new modules MUST follow Domain-Driven boundaries. No cross-domain direct database updates; use services.
2.  **Security**: Every API route MUST invoke `requireSession()` and `requirePermission()`.
3.  **Auditing**: Any state change via `POST`, `PUT`, `DELETE` MUST invoke `logAudit()`.
4.  **Database**: No table may be created without `organization_id`. `DROP` operations on financial data are strictly forbidden.
5.  **Styling**: No custom CSS allowed. Tailwind utility classes mapped to Enterprise Design System tokens only.

---

## PART 14: FINAL EXECUTIVE DELIVERABLE

The **ASAS Real Estate OS** is architected to be the definitive platform for MENA and global real estate operators. By enforcing strict multi-tenancy, double-entry financial integrity, and AI-native operational oversight, ASAS transitions from a visual dashboard into a mission-critical Enterprise Utility.

This blueprint establishes the immutable laws for scaling the platform to 100k+ clients while maintaining security, performance, and operational excellence.
