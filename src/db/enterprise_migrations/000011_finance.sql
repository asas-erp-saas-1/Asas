-- Migration: 000011_finance.sql
-- Description: Core immutable financial ledger (Chart of Accounts, Journal Entries, Ledger Lines) and Invoices.

-- 1. Chart of Accounts
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'asset', 'liability', 'equity', 'revenue', 'expense'
    parent_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_accounts_org_code UNIQUE (organization_id, code)
);

CREATE TRIGGER trg_accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Journal Entries (Transaction Grouping)
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reference_code VARCHAR(100) NOT NULL,
    description TEXT,
    entry_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'posted', -- 'draft', 'posted', 'voided'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_journal_entries_updated_at
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 3. Ledger Lines (Immutable Double-Entry Basics)
CREATE TABLE IF NOT EXISTS ledger_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('debit', 'credit')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'DZD',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE -- Use soft deletes, NO true DELETEs
);

CREATE TRIGGER trg_ledger_lines_updated_at
    BEFORE UPDATE ON ledger_lines
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 4. Invoices (Billed obligations)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
    reference_code VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid', -- 'unpaid', 'partially_paid', 'paid', 'voided'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_invoices_org_ref UNIQUE (organization_id, reference_code)
);

CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Additional Specific Indexes for Finance
CREATE INDEX IF NOT EXISTS idx_ledger_account ON ledger_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_journal ON ledger_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contact ON invoices(contact_id);

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_accounts ON accounts USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_journal_entries ON journal_entries USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_ledger_lines ON ledger_lines USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_invoices ON invoices USING (organization_id = get_current_tenant_id());
