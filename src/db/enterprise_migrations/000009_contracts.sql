-- Migration: 000009_contracts.sql
-- Description: Contracts management representing the binding legal agreement for a unit sale.

CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    reference_code VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'signed', 'cancelled', 'completed'
    agreed_price DECIMAL(15, 2) NOT NULL,
    signed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_contracts_org_ref UNIQUE (organization_id, reference_code)
);

CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Create specific indexes as defined in the Data Model
CREATE INDEX IF NOT EXISTS idx_contract_org_status ON contracts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contract_unit ON contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_contract_contact ON contracts(contact_id);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_contracts ON contracts USING (organization_id = get_current_tenant_id());
