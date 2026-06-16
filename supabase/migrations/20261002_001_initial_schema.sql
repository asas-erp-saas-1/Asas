-- ASAS RE-OS: Initial Schema for ERP, CRM, Finance, HR / Multi-Tenant

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE SYSTEM TABLES

CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    logo_url TEXT,
    tax_id VARCHAR(50),
    commercial_register VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_profiles_agency_id ON profiles(agency_id);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    phone VARCHAR(50),
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_branches_agency_id ON branches(agency_id);
ALTER TABLE profiles ADD CONSTRAINT fk_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_teams_agency_id ON teams(agency_id);
CREATE INDEX idx_teams_branch_id ON teams(branch_id);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_in_team VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(team_id, profile_id)
);
CREATE INDEX idx_team_members_profile_id ON team_members(profile_id);

CREATE TABLE invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'pending',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_invites_agency_id ON invites(agency_id);

-- 3. CRM & SALES TABLES

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    identity_document_type VARCHAR(50),
    identity_document_number VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_clients_agency_id ON clients(agency_id);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'new',
    interest_type VARCHAR(100),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    campaign_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_leads_agency_id ON leads(agency_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    budget NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_projects_agency_id ON projects(agency_id);

CREATE TABLE project_tranches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_project_tranches_project_id ON project_tranches(project_id);

CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tranche_id UUID REFERENCES project_tranches(id) ON DELETE SET NULL,
    unit_number VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    surface_area NUMERIC,
    floor_level INTEGER,
    base_price NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_units_project_id ON units(project_id);
CREATE INDEX idx_units_status ON units(status);

CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    deal_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    amount NUMERIC NOT NULL,
    discount_percentage NUMERIC,
    agreed_price NUMERIC NOT NULL,
    payment_model VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_deals_agency_id ON deals(agency_id);
CREATE INDEX idx_deals_client_id ON deals(client_id);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);

-- 4. FINANCE & ACCOUNTING

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    amount NUMERIC NOT NULL,
    tax_amount NUMERIC,
    total_amount NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    issue_date DATE NOT NULL,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(agency_id, invoice_number)
);
CREATE INDEX idx_invoices_agency_id ON invoices(agency_id);
CREATE INDEX idx_invoices_deal_id ON invoices(deal_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    reference VARCHAR(100),
    amount NUMERIC NOT NULL,
    currency VARCHAR(10) DEFAULT 'DZD',
    payment_method VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    received_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_payments_agency_id ON payments(agency_id);
CREATE INDEX idx_payments_deal_id ON payments(deal_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

CREATE TABLE commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_commissions_agency_id ON commissions(agency_id);

CREATE TABLE treasury_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- income, expense
    amount NUMERIC NOT NULL,
    category VARCHAR(100),
    description TEXT,
    reference_id UUID,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX idx_treasury_transactions_agency_id ON treasury_transactions(agency_id);

-- 5. HR & PAYROLL

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    nss VARCHAR(100),
    base_salary NUMERIC,
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_employees_agency_id ON employees(agency_id);
CREATE INDEX idx_employees_profile_id ON employees(profile_id);

CREATE TABLE employee_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'present',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_employee_attendance_emp_date ON employee_attendance(employee_id, date);

CREATE TABLE employee_leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_employee_leaves_employee_id ON employee_leaves(employee_id);

CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    base_amount NUMERIC NOT NULL,
    bonuses NUMERIC DEFAULT 0,
    deductions NUMERIC DEFAULT 0,
    net_payable NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);

-- 6. SYSTEM CORE (Tasks, Events, Inbox)

CREATE TABLE sys_audit_vault (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correlation_id UUID,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    operation_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    request_ip VARCHAR(50),
    device_signature TEXT,
    is_anomaly BOOLEAN DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_sys_audit_vault_agency_id ON sys_audit_vault(agency_id);

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    channel VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    participant_id UUID,
    content TEXT,
    sentiment_score NUMERIC,
    sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_activities_agency_id ON activities(agency_id);
CREATE INDEX idx_activities_participant_id ON activities(participant_id);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    task_status VARCHAR(50) DEFAULT 'pending',
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    associated_entity_type VARCHAR(100),
    associated_entity_id UUID,
    sla_escalation_marker_hours INTEGER,
    escalation_count INTEGER DEFAULT 0,
    escalated_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_tasks_agency_id ON tasks(agency_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);

CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    source_module VARCHAR(100) NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_system_events_agency_id ON system_events(agency_id);
CREATE INDEX idx_system_events_aggregate ON system_events(aggregate_type, aggregate_id);

CREATE TABLE execution_inbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    task_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'pending',
    assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    role_target VARCHAR(50),
    domain VARCHAR(100) NOT NULL,
    reference_aggregate_type VARCHAR(100) NOT NULL,
    reference_aggregate_id UUID NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    sla_breach_at TIMESTAMP WITH TIME ZONE,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);
CREATE INDEX idx_execution_inbox_agency_id ON execution_inbox(agency_id);
CREATE INDEX idx_execution_inbox_assignee_id ON execution_inbox(assignee_id);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    lifecycle_state VARCHAR(50) DEFAULT 'draft',
    associated_entity_type VARCHAR(100),
    associated_entity_id UUID,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    hash_signature TEXT,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_documents_agency_id ON documents(agency_id);
CREATE INDEX idx_documents_associated ON documents(associated_entity_type, associated_entity_id);

-- 7. APPROVALS

CREATE TABLE approval_chains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    target_type VARCHAR(100) NOT NULL,
    target_id UUID NOT NULL,
    domain VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_approval_chains_agency_id ON approval_chains(agency_id);

CREATE TABLE approval_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id UUID NOT NULL REFERENCES approval_chains(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    required_role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    acted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    acted_at TIMESTAMP WITH TIME ZONE,
    comments TEXT
);
CREATE INDEX idx_approval_steps_chain_id ON approval_steps(chain_id);

-- 8. SERVICE AND SUPPORT

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_tickets_agency_id ON tickets(agency_id);
CREATE INDEX idx_tickets_client_id ON tickets(client_id);

-- 9. SUPPLY CHAIN & PROCUREMENT

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    tax_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_suppliers_agency_id ON suppliers(agency_id);

CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    estimated_amount NUMERIC,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_purchase_requests_project_id ON purchase_requests(project_id);

CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE SET NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);

CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity_on_hand NUMERIC DEFAULT 0,
    unit_of_measure VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_inventory_items_agency_id ON inventory_items(agency_id);

-- 10. MARKETING AND OPS

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    budget NUMERIC,
    spent NUMERIC DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_campaigns_agency_id ON campaigns(agency_id);

CREATE TABLE construction_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    percentage_completion NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_construction_milestones_project_id ON construction_milestones(project_id);

CREATE TABLE site_daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES construction_milestones(id) ON DELETE SET NULL,
    log_date DATE NOT NULL,
    weather_conditions VARCHAR(100),
    workers_count INTEGER,
    progress_notes TEXT,
    issues_reported TEXT,
    logged_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_site_daily_logs_project_id ON site_daily_logs(project_id);

CREATE TABLE legal_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    notary_name VARCHAR(255),
    notary_appointment_date TIMESTAMP WITH TIME ZONE,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_legal_contracts_deal_id ON legal_contracts(deal_id);


-- ==========================================
-- ROW LEVEL SECURITY (MULTI-TENANCY)
-- ==========================================

-- Optimized Function to get current user's agency_id securely using Security Definer
-- We use a highly optimized approach that prevents infinite recursion during RLS checks
CREATE OR REPLACE FUNCTION get_current_agency_id()
RETURNS UUID AS $$
DECLARE
  v_agency_id UUID;
BEGIN
  -- We query the profile table securely. Because it's SECURITY DEFINER and we set the search path, 
  -- it bypasses the RLS constraints temporarily to read the core agency identity.
  SELECT agency_id INTO v_agency_id
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN v_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Enable RLS on ALL Tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tranches ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_audit_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_contracts ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Assignment targeting all tables featuring an agency_id
DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'agency_id' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE POLICY "Tenant Isolation: %I" ON public.%I
            FOR ALL
            USING (agency_id = public.get_current_agency_id());
        ', t_name, t_name);
    END LOOP;
END
$$;

-- Specific overrides/additions to preserve access during Onboarding and self-service
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid() OR agency_id = public.get_current_agency_id());
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Secure profile update" ON public.profiles FOR UPDATE USING (
    id = auth.uid() 
    OR 
    (agency_id = public.get_current_agency_id() AND EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'manager')
    ))
);
CREATE POLICY "Anyone can insert their profile during creation" ON public.profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Agencies are readable by their authenticated users" ON public.agencies FOR SELECT USING (id = public.get_current_agency_id());
CREATE POLICY "New agencies can be created on signup" ON public.agencies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Derived Constraints for Non-Agency-ID tables
CREATE POLICY "Project tranches inherit project agency security" ON public.project_tranches
FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE agency_id = public.get_current_agency_id()));

CREATE POLICY "Units inherit project agency security" ON public.units
FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE agency_id = public.get_current_agency_id()));

CREATE POLICY "Purchase Requests inherit project agency security" ON public.purchase_requests
FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE agency_id = public.get_current_agency_id()));

CREATE POLICY "Purchase Orders inherit supplier agency security" ON public.purchase_orders
FOR ALL USING (supplier_id IN (SELECT id FROM public.suppliers WHERE agency_id = public.get_current_agency_id()));

CREATE POLICY "Construction milestones inherit project security" ON public.construction_milestones
FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE agency_id = public.get_current_agency_id()));

CREATE POLICY "Site Daily Logs inherit project security" ON public.site_daily_logs
FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE agency_id = public.get_current_agency_id()));

CREATE POLICY "Approval steps inherit chain security" ON public.approval_steps
FOR ALL USING (chain_id IN (SELECT id FROM public.approval_chains WHERE agency_id = public.get_current_agency_id()));

-- System Audits & Timestamp Triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION set_updated_at();
        ', t_name, t_name);
    END LOOP;
END
$$;

