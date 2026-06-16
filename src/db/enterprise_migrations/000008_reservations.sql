-- Migration: 000008_reservations.sql
-- Description: Reservations management. Handles temporary holds/locks on inventory units by prospects.

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE RESTRICT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'converted', 'cancelled'
    expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
    deposit_amount DECIMAL(15, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Create specific indexes
CREATE INDEX IF NOT EXISTS idx_reservations_org_status ON reservations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_unit ON reservations(unit_id);
CREATE INDEX IF NOT EXISTS idx_reservations_contact ON reservations(contact_id);

-- Enable RLS
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_reservations ON reservations USING (organization_id = get_current_tenant_id());
