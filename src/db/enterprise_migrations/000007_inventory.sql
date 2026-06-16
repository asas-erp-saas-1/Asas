-- Migration: 000007_inventory.sql
-- Description: Inventory management structures including Floorplans and Unit refinements.

CREATE TABLE IF NOT EXISTS floorplans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- e.g., '1BR', '2BR', 'Studio', 'Retail'
    total_area_sqm DECIMAL(10, 2),
    internal_area_sqm DECIMAL(10, 2),
    balcony_area_sqm DECIMAL(10, 2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_floorplans_updated_at
    BEFORE UPDATE ON floorplans
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Alter units to link to floorplans
ALTER TABLE units ADD COLUMN IF NOT EXISTS floorplan_id UUID REFERENCES floorplans(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE floorplans ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_floorplans ON floorplans USING (organization_id = get_current_tenant_id());
