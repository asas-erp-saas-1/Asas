# ASAS Real Estate ERP Kernel Plan

## Phase 1: Kernel Bootstrap (Event-Driven Architecture)
- Define `system_events` table for Event Sourcing
- Implement `EventRouter` and `CommandBus` in TypeScript
- Define Base `AggregateRoot` and `EventHandler` interfaces
- Centralize DDD patterns in `/src/lib/kernel/core.ts`

## Phase 2: Execution Inbox System
- Define `execution_inbox` table to push work to users instead of pulling
- Implement Inbox Rules Engine for SLA and routing
- Create Inbox Hooks and basic Dashboard widget components

## Phase 3: Approval Engine
- Define `approval_requests` and `approval_rules` schema
- Implement Hierarchical Approval Logic (Finance, Legal, etc.)
- Connect to Event Router (e.g. `DealRequiresApproval` -> generates Inbox task)

## Phase 4: Core Domain State Machines
- **CRM Domain**: Lead Lifecycle, Deal Generation (VSP model)
- **Finance Domain**: Payment validation, Treasury allocation
- **Construction Domain**: Project Phasing, Milestone Tracking, Daily Logs
- **Procurement & Inventory**: Purchase Requests, Purchase Orders, Delivery

## Phase 5: Event Taxonomy implementation
- Central event definitions mapping
- Trigger logic & Domain Handlers

We will implement the initial bootstrap, database schema, and core event/inbox implementation code to establish this foundation.
