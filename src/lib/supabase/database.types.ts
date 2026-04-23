export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      approvals: {
        Row: {
          action: string;
          actioned_at: string | null;
          comment: string | null;
          expense_id: string;
          id: string;
          reviewer_id: string;
          step: number | null;
        };
        Insert: {
          action: string;
          actioned_at?: string | null;
          comment?: string | null;
          expense_id: string;
          id?: string;
          reviewer_id: string;
          step?: number | null;
        };
        Update: {
          action?: string;
          actioned_at?: string | null;
          comment?: string | null;
          expense_id?: string;
          id?: string;
          reviewer_id?: string;
          step?: number | null;
        };
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          changes: Json | null;
          created_at: string | null;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: string | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          changes?: Json | null;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          changes?: Json | null;
          created_at?: string | null;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: string | null;
        };
      };
      categories: {
        Row: {
          created_at: string | null;
          icon: string | null;
          id: string;
          is_active: boolean | null;
          max_limit: number | null;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_limit?: number | null;
          name: string;
        };
        Update: {
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_limit?: number | null;
          name?: string;
        };
      };
      departments: {
        Row: {
          created_at: string | null;
          head_id: string | null;
          id: string;
          monthly_budget: number | null;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          head_id?: string | null;
          id?: string;
          monthly_budget?: number | null;
          name: string;
        };
        Update: {
          created_at?: string | null;
          head_id?: string | null;
          id?: string;
          monthly_budget?: number | null;
          name?: string;
        };
      };
      expenses: {
        Row: {
          amount: number;
          category_id: string | null;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          expense_date: string;
          id: string;
          receipt_url: string | null;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          category_id?: string | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          expense_date?: string;
          id?: string;
          receipt_url?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          category_id?: string | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          expense_date?: string;
          id?: string;
          receipt_url?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
      };
      notifications: {
        Row: {
          created_at: string | null;
          id: string;
          is_read: boolean | null;
          message: string;
          metadata: Json | null;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          metadata?: Json | null;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          metadata?: Json | null;
          type?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bank_account: string | null;
          bank_name: string | null;
          created_at: string | null;
          department_id: string | null;
          email: string;
          id: string;
          is_active: boolean | null;
          name: string;
          role: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bank_account?: string | null;
          bank_name?: string | null;
          created_at?: string | null;
          department_id?: string | null;
          email: string;
          id: string;
          is_active?: boolean | null;
          name: string;
          role?: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bank_account?: string | null;
          bank_name?: string | null;
          created_at?: string | null;
          department_id?: string | null;
          email?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          role?: string;
          updated_at?: string | null;
        };
      };
      settlements: {
        Row: {
          amount_paid: number;
          expense_id: string;
          id: string;
          paid_by: string;
          payment_method: string | null;
          reference_no: string | null;
          settled_at: string | null;
        };
        Insert: {
          amount_paid: number;
          expense_id: string;
          id?: string;
          paid_by: string;
          payment_method?: string | null;
          reference_no?: string | null;
          settled_at?: string | null;
        };
        Update: {
          amount_paid?: number;
          expense_id?: string;
          id?: string;
          paid_by?: string;
          payment_method?: string | null;
          reference_no?: string | null;
          settled_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
