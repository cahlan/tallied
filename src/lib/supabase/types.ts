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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          stripe_customer_id: string | null;
          subscription_status: "free" | "pro" | "self_hosted" | "canceled";
          subscription_id: string | null;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: "free" | "pro" | "self_hosted" | "canceled";
          subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: "free" | "pro" | "self_hosted" | "canceled";
          subscription_id?: string | null;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          vendor_name: string | null;
          transaction_date: string | null;
          amount: number | null;
          currency: string;
          category: string | null;
          ai_category: string | null;
          has_tax: boolean;
          tax_amount: number | null;
          notes: string | null;
          image_url: string | null;
          raw_extraction: Json | null;
          extraction_status: "pending" | "success" | "failed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_name?: string | null;
          transaction_date?: string | null;
          amount?: number | null;
          currency?: string;
          category?: string | null;
          ai_category?: string | null;
          has_tax?: boolean;
          tax_amount?: number | null;
          notes?: string | null;
          image_url?: string | null;
          raw_extraction?: Json | null;
          extraction_status?: "pending" | "success" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_name?: string | null;
          transaction_date?: string | null;
          amount?: number | null;
          currency?: string;
          category?: string | null;
          ai_category?: string | null;
          has_tax?: boolean;
          tax_amount?: number | null;
          notes?: string | null;
          image_url?: string | null;
          raw_extraction?: Json | null;
          extraction_status?: "pending" | "success" | "failed";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      category_rules: {
        Row: {
          id: string;
          user_id: string;
          vendor_pattern: string;
          category: string;
          is_exact_match: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vendor_pattern: string;
          category: string;
          is_exact_match?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vendor_pattern?: string;
          category?: string;
          is_exact_match?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      scan_usage: {
        Row: {
          id: string;
          user_id: string;
          month: string;
          scan_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: string;
          scan_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: string;
          scan_count?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_scan_count: {
        Args: { p_user_id: string };
        Returns: number;
      };
      get_scan_count: {
        Args: { p_user_id: string };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
