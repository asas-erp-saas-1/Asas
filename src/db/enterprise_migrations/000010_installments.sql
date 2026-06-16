-- Migration: 000010_installments.sql
-- Description: Installment schedules for contracts representing expected forward-looking cash flows.

CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., 'Booking Deposit', '1st Installment', 'Handover Payment'
    amount DECIMAL(15, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_installments_updated_at
    BEFORE UPDATE ON installments
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Indexes for querying overdue and contract-specific schedules
CREATE INDEX IF NOT EXISTS idx_installments_org_status ON installments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_installments_contract ON installments(contract_id);
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(organization_id, due_date);

-- Enable RLS
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_installments ON installments USING (organization_id = get_current_tenant_id());
