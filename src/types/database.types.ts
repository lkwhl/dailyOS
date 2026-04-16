export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      calendar_events: {
        Row: {
          all_day: boolean
          created_at: string
          description: string | null
          ends_at: string | null
          event_date: string
          event_type: string
          id: string
          is_cancelled: boolean
          location: string | null
          metadata: Json | null
          recurrence_rule_id: string | null
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_date: string
          event_type: string
          id?: string
          is_cancelled?: boolean
          location?: string | null
          metadata?: Json | null
          recurrence_rule_id?: string | null
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_cancelled?: boolean
          location?: string | null
          metadata?: Json | null
          recurrence_rule_id?: string | null
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_recurrence_rule_id_fkey"
            columns: ["recurrence_rule_id"]
            isOneToOne: false
            referencedRelation: "calendar_recurrence_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_recurrence_rules: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          ends_on: string | null
          frequency: string
          id: string
          interval: number
          starts_on: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          ends_on?: string | null
          frequency: string
          id?: string
          interval?: number
          starts_on: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          ends_on?: string | null
          frequency?: string
          id?: string
          interval?: number
          starts_on?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_bill_months: {
        Row: {
          amount: number | null
          bill_id: string
          created_at: string
          id: string
          is_paid: boolean
          paid_at: string | null
          reference_month: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          bill_id: string
          created_at?: string
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          reference_month: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          bill_id?: string
          created_at?: string
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          reference_month?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_bill_months_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "finance_bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_bill_months_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "v_bills_this_month"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_bills: {
        Row: {
          created_at: string
          due_day: number
          id: string
          is_active: boolean
          last_amount: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_day: number
          id?: string
          is_active?: boolean
          last_amount?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean
          last_amount?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string
          counterpart: string | null
          created_at: string
          description: string | null
          id: string
          raw_input: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          counterpart?: string | null
          created_at?: string
          description?: string | null
          id?: string
          raw_input?: string | null
          transaction_date: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          counterpart?: string | null
          created_at?: string
          description?: string | null
          id?: string
          raw_input?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      routine_reminders: {
        Row: {
          created_at: string
          days_of_week: number[]
          id: string
          is_active: boolean
          reminder_time: string
          snooze_options: number[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          reminder_time: string
          snooze_options?: number[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_active?: boolean
          reminder_time?: string
          snooze_options?: number[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      routine_tasks: {
        Row: {
          carried_over_from: string | null
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          task_date: string
          title: string
          updated_at: string
        }
        Insert: {
          carried_over_from?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          task_date: string
          title: string
          updated_at?: string
        }
        Update: {
          carried_over_from?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          task_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_bills_this_month: {
        Row: {
          days_until_due: number | null
          due_date: string | null
          due_day: number | null
          id: string | null
          is_paid: boolean | null
          last_amount: number | null
          name: string | null
          paid_at: string | null
          this_month_amount: number | null
        }
        Relationships: []
      }
      v_monthly_spending: {
        Row: {
          category: string | null
          month: string | null
          total: number | null
          transaction_count: number | null
          type: string | null
        }
        Relationships: []
      }
      v_pending_tasks: {
        Row: {
          carried_over_from: string | null
          days_overdue: number | null
          id: string | null
          task_date: string | null
          title: string | null
        }
        Insert: {
          carried_over_from?: string | null
          days_overdue?: never
          id?: string | null
          task_date?: string | null
          title?: string | null
        }
        Update: {
          carried_over_from?: string | null
          days_overdue?: never
          id?: string | null
          task_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      v_upcoming_events: {
        Row: {
          days_until: number | null
          event_date: string | null
          event_type: string | null
          id: string | null
          location: string | null
          metadata: Json | null
          starts_at: string | null
          title: string | null
        }
        Insert: {
          days_until?: never
          event_date?: string | null
          event_type?: string | null
          id?: string | null
          location?: string | null
          metadata?: Json | null
          starts_at?: string | null
          title?: string | null
        }
        Update: {
          days_until?: never
          event_date?: string | null
          event_type?: string | null
          id?: string | null
          location?: string | null
          metadata?: Json | null
          starts_at?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
