-- Migration: 000006_units.sql
-- Description: Units structure representing the sellable physical assets (apartments, retail spaces, etc.).

CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    reference_code VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'reserved', 'sold', 'blocked'
    floor INT,
    area_sqm DECIMAL(10, 2),
    base_price DECIMAL(15, 2),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_units_org_ref UNIQUE (organization_id, reference_code)
);

CREATE TRIGGER trg_units_updated_at
    BEFORE UPDATE ON units
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Create specific indexes as defined in the Data Model
CREATE INDEX IF NOT EXISTS idx_unit_org_status ON units(organization_id, status);

-- Enable RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_units ON units USING (organization_id = get_current_tenant_id());
