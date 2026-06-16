-- Migration: 000002_organizations.sql
-- Description: Extending Organization structures (Departments, Settings) and implementing Row Level Security (RLS) policies for tenant isolation across IAM and Organization tables.

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_departments_org_name UNIQUE (organization_id, name)
);

CREATE TRIGGER trg_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Organization Settings Table
CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    CONSTRAINT idx_org_settings_key UNIQUE (organization_id, setting_key)
);

CREATE TRIGGER trg_org_settings_updated_at
    BEFORE UPDATE ON organization_settings
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 3. Update Users Table to explicitly map to Departments
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy Setup (Tenant Isolation implementation)
-- We use a database session variable 'app.tenant_id' to enforce strict multi-tenancy.
-- Using Supabase, this variable can be automatically set from JWT claims via custom claims, or injected via middleware.
CREATE OR REPLACE FUNCTION get_current_tenant_id() RETURNS UUID AS $$
BEGIN
  -- Attempt to get tenant from standard configuration setting
  RETURN NULLIF(current_setting('app.tenant_id', TRUE), '')::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Tenant Isolation Policies
-- Organizations
CREATE POLICY isolate_tenant_organizations ON organizations
    USING (id = get_current_tenant_id());

-- Users
CREATE POLICY isolate_tenant_users ON users
    USING (organization_id = get_current_tenant_id());

-- Roles
CREATE POLICY isolate_tenant_roles ON roles
    USING (organization_id = get_current_tenant_id());

-- Role Permissions
CREATE POLICY isolate_tenant_role_permissions ON role_permissions
    USING (organization_id = get_current_tenant_id());

-- Sessions
CREATE POLICY isolate_tenant_sessions ON sessions
    USING (organization_id = get_current_tenant_id());

-- Departments
CREATE POLICY isolate_tenant_departments ON departments
    USING (organization_id = get_current_tenant_id());

-- Organization Settings
CREATE POLICY isolate_tenant_org_settings ON organization_settings
    USING (organization_id = get_current_tenant_id());
