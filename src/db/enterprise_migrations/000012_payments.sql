-- Migration: 000012_payments.sql
-- Description: Financial receipts, payments tracking, and commission calculations.

-- 1. Payments (Actual funds received or disbursed)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    reference_code VARCHAR(100) NOT NULL, -- Receipt number or Bank Transaction ID
    method VARCHAR(50), -- 'bank_transfer', 'cheque', 'cash', 'card', etc.
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'DZD',
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'refunded'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_payments_org_ref UNIQUE (organization_id, reference_code)
);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Commissions (Computed broker/agent fees)
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- The recipient agent/broker
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL, -- Link to accounting when paid/accrued
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'DZD',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'paid', 'cancelled'
    due_date DATE,
    paid_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_commissions_updated_at
    BEFORE UPDATE ON commissions
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();


-- Specific Indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_commissions_contract ON commissions(contract_id);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_payments ON payments USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_commissions ON commissions USING (organization_id = get_current_tenant_id());
