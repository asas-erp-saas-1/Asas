// src/types/app.ts
// Central domain type definitions — aligning perfectly with the latest Supabase schema

export type UserRole = 'admin' | 'manager' | 'agent';

export interface Profile {
  id: string
  agency_id: string | null
  branch_id: string | null
  first_name: string | null
  last_name: string | null
  role: UserRole | string
  created_at: string
  updated_at: string
  // Virtual
  full_name?: string
}

export interface Branch {
  id: string
  agency_id: string
  name: string
  code: string | null
  city: string | null
  address: string | null
  phone: string | null
  location: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  agency_id: string
  branch_id: string | null
  name: string
  manager_id: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  agency_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  identity_document_type: string | null
  identity_document_number: string | null
  address: string | null
  created_at: string
  updated_at: string
  // Virtual
  full_name?: string
}

export interface Lead {
  id: string
  agency_id: string
  first_name: string
  last_name: string
  phone: string | null
  email: string | null
  status: string | null
  interest_type: string | null
  assigned_to: string | null
  campaign_id: string | null
  created_at: string
  updated_at: string
  // Legacy / UI properties
  source?: string | null
  budget_min?: number | null
  budget_max?: number | null
  lost_reason?: string | null
  notes?: string | null
  last_activity?: string
  deleted_at?: string | null
  assigned_agent?: string | null
}

export interface Project {
  id: string
  agency_id: string
  name: string
  description: string | null
  location: string | null
  status: string | null
  budget: number | null
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  project_id: string
  tranche_id: string | null
  unit_number: string
  type: string
  surface_area: number | null
  floor_level: number | null
  base_price: number
  status: string | null
  created_at: string
  updated_at: string
  // alias for older code compatibility
  projects?: Project | null
  list_price: number
  area_sqm?: number | null
  reference_code: string | null
  rooms?: string | null
}

export type Property = Unit; // To map legacy Property usage

export interface Deal {
  id: string
  agency_id: string
  client_id: string
  unit_id: string | null
  assigned_to: string | null
  deal_type: string
  status: string | null
  amount: number
  discount_percentage: number | null
  agreed_price: number
  payment_model: string | null
  created_at: string
  updated_at: string
  
  // Custom joined fields for UI support
  clients?: Partial<Client> | null
  profiles?: Partial<Profile> | null
  units?: Unit & { projects?: Project | null } | null
  properties?: Property & { projects?: Project | null } | null
  deal_payments?: any[] | null
  contract_date?: string | null
  closing_date?: string | null
  notes?: string | null
  next_action?: string | null
  next_action_due?: string | null
  risk_level?: string
  at_risk_since?: string | null
  total_payments_scheduled?: number
  total_payments_received?: number
  activated_at?: string | null
  negotiation_started_at?: string | null
  commission_generated?: boolean
  cancellation_reason?: string | null
  penalty_applied?: boolean
  total_refunded?: number
  version: number
  lost_reason?: string | null
  notary_documents?: { id: string, name: string, status: 'missing' | 'uploaded' }[] | null
  deleted_at?: string | null
}

export interface Invoice {
  id: string
  agency_id: string
  deal_id: string | null
  client_id: string
  invoice_number: string
  amount: number
  tax_amount: number | null
  total_amount: number
  status: string | null
  issue_date: string
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  agency_id: string
  deal_id: string | null
  invoice_id: string | null
  reference: string | null
  amount: number
  currency: string | null
  payment_method: string | null
  status: string | null
  due_date: string | null
  received_at: string | null
  verified_by: string | null
  created_at: string
  updated_at: string
}

export interface Commission {
  id: string
  agency_id: string
  deal_id: string
  agent_id: string
  amount: number
  status: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  agency_id: string
  branch_id: string | null
  channel: string
  direction: string
  participant_id: string | null
  content: string | null
  sentiment_score: number | null
  sent_by: string | null
  status: string | null
  created_at: string
  updated_at: string

  type: string
  description: string
  lead_id?: string | null
  deal_id?: string | null
  deleted_at?: string | null
  profiles?: Partial<Profile> | null
}

export interface Task {
  id: string
  agency_id: string
  branch_id: string | null
  title: string
  description: string | null
  priority: string | null
  task_status: string | null
  due_date: string | null
  assigned_to: string | null
  created_by: string | null
  associated_entity_type: string | null
  associated_entity_id: string | null
  sla_escalation_marker_hours: number | null
  escalation_count: number | null
  escalated_to: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  status?: string | null
  lead_id?: string | null
  deal_id?: string | null
  done_at?: string | null
  is_automated?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}
