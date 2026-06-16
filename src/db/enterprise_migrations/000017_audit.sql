-- Migration: 000017_audit.sql
-- Description: Centralized immutable audit logging for security and compliance tracking.

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- User who performed the action
    action VARCHAR(50) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'invoice', 'contract', 'user'
    entity_id UUID, -- The ID of the affected record
    old_payload JSONB, -- State before the action
    new_payload JSONB, -- State after the action
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    -- Note: No updated_at or deleted_at because this table is strictly append-only.
);

-- Enforce immutability at the database level using a trigger
CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Updates and deletions are strictly forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_immutable
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();

-- Specific Indexes for rapid compliance querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_entity ON audit_logs(organization_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(organization_id, created_at DESC);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
-- Viewing audit logs is constrained to the tenant
CREATE POLICY isolate_tenant_audit_logs_select ON audit_logs
    FOR SELECT
    USING (organization_id = get_current_tenant_id());

-- Inserting audit logs is constrained to the tenant
CREATE POLICY isolate_tenant_audit_logs_insert ON audit_logs
    FOR INSERT
    WITH CHECK (organization_id = get_current_tenant_id());
