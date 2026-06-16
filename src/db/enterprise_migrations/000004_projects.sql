-- Migration: 000004_projects.sql
-- Description: Real Estate Development Projects core structure.

-- 1. Projects (Master Development)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    reference_code VARCHAR(100),
    description TEXT,
    location TEXT,
    status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'under_construction', 'completed', 'on_hold'
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    budget DECIMAL(15, 2),
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_projects_org_ref UNIQUE (organization_id, reference_code)
);

CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Project Milestones (Construction Tracking Phase 1)
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'delayed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_project_milestones_updated_at
    BEFORE UPDATE ON project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_projects ON projects USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_project_milestones ON project_milestones USING (organization_id = get_current_tenant_id());
