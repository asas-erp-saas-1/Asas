-- Migration: 000018_reporting.sql
-- Description: Caching and configuration structures for enterprise reporting and BI dashboards.

-- 1. Dashboard Configurations (User or Organization level saved views)
CREATE TABLE IF NOT EXISTS dashboard_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- If null, it's an org-level layout
    name VARCHAR(255) NOT NULL,
    layout JSONB NOT NULL, -- Grid placement and component selections
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_dashboard_configs_updated_at
    BEFORE UPDATE ON dashboard_configs
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Report Caches (Materialized views alternative for heavy analytics)
CREATE TABLE IF NOT EXISTS report_caches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    report_key VARCHAR(100) NOT NULL, -- e.g., 'monthly_revenue', 'inventory_status'
    data_payload JSONB NOT NULL, -- The pre-calculated metric data
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    -- No deleted_at needed as these are ephemeral caches
    CONSTRAINT idx_report_caches_org_key UNIQUE (organization_id, report_key)
);

CREATE TRIGGER trg_report_caches_updated_at
    BEFORE UPDATE ON report_caches
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_caches ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_dashboard_configs ON dashboard_configs USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_report_caches ON report_caches USING (organization_id = get_current_tenant_id());
