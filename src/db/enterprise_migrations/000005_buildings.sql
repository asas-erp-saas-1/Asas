-- Migration: 000005_buildings.sql
-- Description: Buildings structure representing physical structures within a project.

-- 1. Buildings (Structures within a Master Project)
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    reference_code VARCHAR(100),
    type VARCHAR(100), -- 'residential', 'commercial', 'mixed_use'
    total_floors INT,
    status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'under_construction', 'completed'
    handover_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_buildings_org_ref UNIQUE (organization_id, reference_code)
);

CREATE TRIGGER trg_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_buildings ON buildings USING (organization_id = get_current_tenant_id());
