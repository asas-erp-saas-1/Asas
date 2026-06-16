-- Migration: 000014_workflows.sql
-- Description: Workflow Engine and Task Management. Handles automated business processes, task assignments, and external webhooks.

-- 1. Tasks (Manual or System-assigned tasks tied to various entities)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type VARCHAR(50), -- e.g., 'lead', 'contract', 'project' (polymorphic)
    entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Workflow Rules (Automation logic)
CREATE TABLE IF NOT EXISTS workflow_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL, -- e.g., 'reservation.created', 'invoice.paid'
    conditions JSONB, -- JSON representation of criteria (e.g., amount > 10000)
    actions JSONB NOT NULL, -- Array of actions (e.g., 'send_email', 'create_task')
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_workflow_rules_updated_at
    BEFORE UPDATE ON workflow_rules
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 3. Workflow Executions (Audit/trace of automated processes)
CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workflow_rule_id UUID REFERENCES workflow_rules(id) ON DELETE SET NULL,
    trigger_payload JSONB, -- The event data that started the execution
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'failed'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    logs JSONB, -- Execution details and error traces
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_workflow_executions_updated_at
    BEFORE UPDATE ON workflow_executions
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 4. Webhooks (External integrations triggered by events/workflows)
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    endpoint_url TEXT NOT NULL,
    events JSONB NOT NULL, -- Array of subscribed events, e.g., ["contract.signed"]
    secret_key VARCHAR(255), -- For payload verification signing
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Specific Indexes for fast polymorphic routing and event matching
CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_workflow_rules_trigger ON workflow_rules(organization_id, trigger_event);
CREATE INDEX IF NOT EXISTS idx_workflow_exec_status ON workflow_executions(status);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_tasks ON tasks USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_workflow_rules ON workflow_rules USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_workflow_executions ON workflow_executions USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_webhooks ON webhooks USING (organization_id = get_current_tenant_id());
