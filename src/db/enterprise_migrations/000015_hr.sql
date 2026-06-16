-- Migration: 000015_hr.sql
-- Description: Human Resources and Support Management. Handles Employee profiles and Support Tickets.

-- 1. Employees (HR extension of the Users table)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    employee_number VARCHAR(100),
    job_title VARCHAR(150),
    hire_date DATE,
    employment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'probation', 'terminated', 'on_leave'
    salary DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'DZD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_employees_org_user UNIQUE (organization_id, user_id)
);

CREATE TRIGGER trg_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Tickets (Customer support & internal IT/Maintenance requests)
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- External user/client
    reported_by_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Internal user reporting
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Agent handling the ticket
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    category VARCHAR(100), -- 'maintenance', 'billing', 'general', 'it', 'complaint'
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 3. Ticket Messages (Thread / Replies)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- If sent by agent
    sender_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- If sent by client
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    -- Ensure at least one sender type is populated
    CONSTRAINT chk_ticket_msg_sender CHECK (sender_user_id IS NOT NULL OR sender_contact_id IS NOT NULL)
);

CREATE TRIGGER trg_ticket_messages_updated_at
    BEFORE UPDATE ON ticket_messages
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Specific Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_org_status ON tickets(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_employees ON employees USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_tickets ON tickets USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_ticket_messages ON ticket_messages USING (organization_id = get_current_tenant_id());
