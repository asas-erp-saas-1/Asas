export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          tax_id: string | null;
          commercial_register: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['agencies']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['agencies']['Row']>;
      };
      invites: {
        Row: {
          id: string;
          agency_id: string;
          email: string;
          role: string;
          token: string;
          status: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['invites']['Row']> & { agency_id: string; email: string; token: string };
        Update: Partial<Database['public']['Tables']['invites']['Row']>;
      };
      branches: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          code: string | null;
          city: string | null;
          address: string | null;
          phone: string | null;
          location: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['branches']['Row']> & { agency_id: string; name: string };
        Update: Partial<Database['public']['Tables']['branches']['Row']>;
      };
      teams: {
        Row: {
          id: string;
          agency_id: string;
          branch_id: string | null;
          name: string;
          manager_id: string | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['teams']['Row']> & { agency_id: string; name: string };
        Update: Partial<Database['public']['Tables']['teams']['Row']>;
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          profile_id: string;
          role_in_team: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['team_members']['Row']> & { team_id: string; profile_id: string };
        Update: Partial<Database['public']['Tables']['team_members']['Row']>;
      };
      profiles: {
        Row: {
          id: string;
          agency_id: string | null;
          branch_id: string | null;
          first_name: string | null;
          last_name: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      sys_audit_vault: {
        Row: {
          id: string;
          correlation_id: string | null;
          actor_id: string | null;
          agency_id: string;
          branch_id: string | null;
          operation_type: string;
          entity_type: string;
          entity_id: string;
          old_values: any | null;
          new_values: any | null;
          request_ip: string | null;
          device_signature: string | null;
          is_anomaly: boolean | null;
          timestamp: string;
        };
        Insert: Partial<Database['public']['Tables']['sys_audit_vault']['Row']> & { agency_id: string; operation_type: string; entity_type: string; entity_id: string };
        Update: Partial<Database['public']['Tables']['sys_audit_vault']['Row']>;
      };
      activities: {
        Row: {
          id: string;
          agency_id: string;
          branch_id: string | null;
          channel: string;
          direction: string;
          participant_id: string | null;
          content: string | null;
          sentiment_score: number | null;
          sent_by: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['activities']['Row']> & { agency_id: string; channel: string; direction: string };
        Update: Partial<Database['public']['Tables']['activities']['Row']>;
      };
      tasks: {
        Row: {
          id: string;
          agency_id: string;
          branch_id: string | null;
          title: string;
          description: string | null;
          priority: string | null;
          task_status: string | null;
          due_date: string | null;
          assigned_to: string | null;
          created_by: string | null;
          associated_entity_type: string | null;
          associated_entity_id: string | null;
          sla_escalation_marker_hours: number | null;
          escalation_count: number | null;
          escalated_to: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tasks']['Row']> & { agency_id: string; title: string };
        Update: Partial<Database['public']['Tables']['tasks']['Row']>;
      };
      documents: {
        Row: {
          id: string;
          agency_id: string;
          branch_id: string | null;
          title: string;
          category: string | null;
          storage_path: string;
          file_size: number | null;
          mime_type: string | null;
          lifecycle_state: string | null;
          associated_entity_type: string | null;
          associated_entity_id: string | null;
          uploaded_by: string | null;
          hash_signature: string | null;
          verified_by: string | null;
          verified_at: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['documents']['Row']> & { agency_id: string; title: string; storage_path: string };
        Update: Partial<Database['public']['Tables']['documents']['Row']>;
      };
      tickets: {
        Row: {
          id: string;
          agency_id: string;
          client_id: string | null;
          unit_id: string | null;
          title: string;
          description: string | null;
          priority: string | null;
          status: string | null;
          assigned_to: string | null;
          category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tickets']['Row']> & { agency_id: string; title: string };
        Update: Partial<Database['public']['Tables']['tickets']['Row']>;
      };
      campaigns: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          type: string | null;
          budget: number | null;
          spent: number | null;
          start_date: string | null;
          end_date: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['campaigns']['Row']> & { agency_id: string; name: string };
        Update: Partial<Database['public']['Tables']['campaigns']['Row']>;
      };
      system_events: {
        Row: {
          id: string;
          agency_id: string;
          event_type: string;
          aggregate_type: string;
          aggregate_id: string;
          payload: Json;
          metadata: Json;
          source_module: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['system_events']['Row']> & { agency_id: string; event_type: string; aggregate_type: string; aggregate_id: string; source_module: string };
        Update: Partial<Database['public']['Tables']['system_events']['Row']>;
      };
      execution_inbox: {
        Row: {
          id: string;
          agency_id: string;
          branch_id: string | null;
          task_type: string;
          title: string;
          description: string | null;
          priority: string | null;
          status: string | null;
          assignee_id: string | null;
          role_target: string | null;
          domain: string;
          reference_aggregate_type: string;
          reference_aggregate_id: string;
          due_date: string | null;
          sla_breach_at: string | null;
          payload: Json | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          completed_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['execution_inbox']['Row']> & { agency_id: string; task_type: string; title: string; domain: string; reference_aggregate_type: string; reference_aggregate_id: string };
        Update: Partial<Database['public']['Tables']['execution_inbox']['Row']>;
      };
      approval_chains: {
        Row: {
          id: string;
          agency_id: string;
          target_type: string;
          target_id: string;
          domain: string;
          status: string | null;
          requested_by: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['approval_chains']['Row']> & { agency_id: string; target_type: string; target_id: string; domain: string; requested_by: string };
        Update: Partial<Database['public']['Tables']['approval_chains']['Row']>;
      };
      approval_steps: {
        Row: {
          id: string;
          chain_id: string;
          step_order: number;
          required_role: string;
          status: string | null;
          acted_by: string | null;
          acted_at: string | null;
          comments: string | null;
        };
        Insert: Partial<Database['public']['Tables']['approval_steps']['Row']> & { chain_id: string; step_order: number; required_role: string };
        Update: Partial<Database['public']['Tables']['approval_steps']['Row']>;
      };
      projects: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          description: string | null;
          location: string | null;
          status: string | null;
          budget: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['projects']['Row']> & { agency_id: string; name: string };
        Update: Partial<Database['public']['Tables']['projects']['Row']>;
      };
      project_tranches: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          status: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['project_tranches']['Row']> & { project_id: string; name: string };
        Update: Partial<Database['public']['Tables']['project_tranches']['Row']>;
      };
      units: {
        Row: {
          id: string;
          project_id: string;
          tranche_id: string | null;
          unit_number: string;
          type: string;
          surface_area: number | null;
          floor_level: number | null;
          base_price: number;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['units']['Row']> & { project_id: string; unit_number: string; type: string; base_price: number };
        Update: Partial<Database['public']['Tables']['units']['Row']>;
      };
      clients: {
        Row: {
          id: string;
          agency_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          identity_document_type: string | null;
          identity_document_number: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['clients']['Row']> & { agency_id: string; first_name: string; last_name: string };
        Update: Partial<Database['public']['Tables']['clients']['Row']>;
      };
      leads: {
        Row: {
          id: string;
          agency_id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          status: string | null;
          interest_type: string | null;
          assigned_to: string | null;
          campaign_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['leads']['Row']> & { agency_id: string; first_name: string; last_name: string };
        Update: Partial<Database['public']['Tables']['leads']['Row']>;
      };
      deals: {
        Row: {
          id: string;
          agency_id: string;
          client_id: string;
          unit_id: string | null;
          assigned_to: string | null;
          deal_type: string;
          status: string | null;
          amount: number;
          discount_percentage: number | null;
          agreed_price: number;
          payment_model: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['deals']['Row']> & { agency_id: string; client_id: string; deal_type: string; amount: number; agreed_price: number };
        Update: Partial<Database['public']['Tables']['deals']['Row']>;
      };
      invoices: {
        Row: {
          id: string;
          agency_id: string;
          deal_id: string | null;
          client_id: string;
          invoice_number: string;
          amount: number;
          tax_amount: number | null;
          total_amount: number;
          status: string | null;
          issue_date: string;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['invoices']['Row']> & { agency_id: string; client_id: string; invoice_number: string; amount: number; total_amount: number; issue_date: string };
        Update: Partial<Database['public']['Tables']['invoices']['Row']>;
      };
      payments: {
        Row: {
          id: string;
          agency_id: string;
          deal_id: string | null;
          invoice_id: string | null;
          reference: string | null;
          amount: number;
          currency: string | null;
          payment_method: string | null;
          status: string | null;
          due_date: string | null;
          received_at: string | null;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payments']['Row']> & { agency_id: string; amount: number };
        Update: Partial<Database['public']['Tables']['payments']['Row']>;
      };
      commissions: {
        Row: {
          id: string;
          agency_id: string;
          deal_id: string;
          agent_id: string;
          amount: number;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['commissions']['Row']> & { agency_id: string; deal_id: string; agent_id: string; amount: number };
        Update: Partial<Database['public']['Tables']['commissions']['Row']>;
      };
      treasury_transactions: {
        Row: {
          id: string;
          agency_id: string;
          type: string;
          amount: number;
          category: string | null;
          description: string | null;
          reference_id: string | null;
          recorded_at: string;
          created_by: string | null;
        };
        Insert: Partial<Database['public']['Tables']['treasury_transactions']['Row']> & { agency_id: string; type: string; amount: number };
        Update: Partial<Database['public']['Tables']['treasury_transactions']['Row']>;
      };
      construction_milestones: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          status: string | null;
          percentage_completion: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['construction_milestones']['Row']> & { project_id: string; name: string };
        Update: Partial<Database['public']['Tables']['construction_milestones']['Row']>;
      };
      site_daily_logs: {
        Row: {
          id: string;
          project_id: string;
          milestone_id: string | null;
          log_date: string;
          weather_conditions: string | null;
          workers_count: number | null;
          progress_notes: string | null;
          issues_reported: string | null;
          logged_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['site_daily_logs']['Row']> & { project_id: string; log_date: string };
        Update: Partial<Database['public']['Tables']['site_daily_logs']['Row']>;
      };
      suppliers: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          contact_email: string | null;
          contact_phone: string | null;
          tax_id: string | null;
          status: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['suppliers']['Row']> & { agency_id: string; name: string };
        Update: Partial<Database['public']['Tables']['suppliers']['Row']>;
      };
      purchase_requests: {
        Row: {
          id: string;
          project_id: string | null;
          requested_by: string | null;
          description: string;
          estimated_amount: number | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['purchase_requests']['Row']> & { description: string };
        Update: Partial<Database['public']['Tables']['purchase_requests']['Row']>;
      };
      purchase_orders: {
        Row: {
          id: string;
          purchase_request_id: string | null;
          supplier_id: string;
          total_amount: number;
          status: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['purchase_orders']['Row']> & { supplier_id: string; total_amount: number };
        Update: Partial<Database['public']['Tables']['purchase_orders']['Row']>;
      };
      inventory_items: {
        Row: {
          id: string;
          agency_id: string;
          project_id: string | null;
          sku: string | null;
          name: string;
          category: string | null;
          quantity_on_hand: number | null;
          unit_of_measure: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['inventory_items']['Row']> & { agency_id: string; name: string };
        Update: Partial<Database['public']['Tables']['inventory_items']['Row']>;
      };
      legal_contracts: {
        Row: {
          id: string;
          deal_id: string;
          client_id: string;
          contract_type: string;
          status: string | null;
          notary_name: string | null;
          notary_appointment_date: string | null;
          document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['legal_contracts']['Row']> & { deal_id: string; client_id: string; contract_type: string };
        Update: Partial<Database['public']['Tables']['legal_contracts']['Row']>;
      };
      employees: {
        Row: {
          id: string;
          profile_id: string | null;
          agency_id: string;
          nss: string | null;
          base_salary: number | null;
          hire_date: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['employees']['Row']> & { agency_id: string };
        Update: Partial<Database['public']['Tables']['employees']['Row']>;
      };
      employee_attendance: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          check_in: string | null;
          check_out: string | null;
          status: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['employee_attendance']['Row']> & { employee_id: string; date: string };
        Update: Partial<Database['public']['Tables']['employee_attendance']['Row']>;
      };
      employee_leaves: {
        Row: {
          id: string;
          employee_id: string;
          type: string;
          start_date: string;
          end_date: string;
          status: string | null;
          approved_by: string | null;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['employee_leaves']['Row']> & { employee_id: string; type: string; start_date: string; end_date: string };
        Update: Partial<Database['public']['Tables']['employee_leaves']['Row']>;
      };
      payroll: {
        Row: {
          id: string;
          employee_id: string;
          month: number;
          year: number;
          base_amount: number;
          bonuses: number | null;
          deductions: number | null;
          net_payable: number;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['payroll']['Row']> & { employee_id: string; month: number; year: number; base_amount: number; net_payable: number };
        Update: Partial<Database['public']['Tables']['payroll']['Row']>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_agency_and_link_owner: {
        Args: {
          _agency_name: string;
          _agency_phone: string;
          _user_id: string;
        };
        Returns: string;
      };
      accept_invite: {
        Args: {
          _token: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
