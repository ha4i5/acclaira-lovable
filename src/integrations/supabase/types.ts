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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked?: boolean
          user_id?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          body_markdown: string
          created_at: string
          feature_image_url: string | null
          generation_id: string | null
          id: string
          keywords: Json
          meta_description: string | null
          published_url: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_markdown: string
          created_at?: string
          feature_image_url?: string | null
          generation_id?: string | null
          id?: string
          keywords?: Json
          meta_description?: string | null
          published_url?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_markdown?: string
          created_at?: string
          feature_image_url?: string | null
          generation_id?: string | null
          id?: string
          keywords?: Json
          meta_description?: string | null
          published_url?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string
          id: string
          kind: string
          meta: Json
          mime: string | null
          path: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          meta?: Json
          mime?: string | null
          path: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          meta?: Json
          mime?: string | null
          path?: string
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          accent_color: string
          created_at: string
          handle: string | null
          id: string
          is_default: boolean
          name: string
          user_id: string
          watermark_text: string | null
        }
        Insert: {
          accent_color?: string
          created_at?: string
          handle?: string | null
          id?: string
          is_default?: boolean
          name: string
          user_id: string
          watermark_text?: string | null
        }
        Update: {
          accent_color?: string
          created_at?: string
          handle?: string | null
          id?: string
          is_default?: boolean
          name?: string
          user_id?: string
          watermark_text?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          meta: Json
          module_key: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          meta?: Json
          module_key?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          meta?: Json
          module_key?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      design_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_global: boolean
          layout: string
          name: string
          palette: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean
          layout?: string
          name: string
          palette?: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_global?: boolean
          layout?: string
          name?: string
          palette?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          credits_used: number
          headline: string
          id: string
          language: string
          module_key: string
          output: Json
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          headline: string
          id?: string
          language?: string
          module_key: string
          output?: Json
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          headline?: string
          id?: string
          language?: string
          module_key?: string
          output?: Json
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      module_rates: {
        Row: {
          credits: number
          label: string
          module_key: string
          updated_at: string
        }
        Insert: {
          credits: number
          label: string
          module_key: string
          updated_at?: string
        }
        Update: {
          credits?: number
          label?: string
          module_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_sources: {
        Row: {
          active: boolean
          created_at: string
          id: string
          kind: string
          label: string
          url: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: string
          label: string
          url: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          kind?: string
          label?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          credits: number
          email: string | null
          full_name: string | null
          id: string
          plan: string
          referral_code: string
          suspended: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id: string
          plan?: string
          referral_code?: string
          suspended?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          plan?: string
          referral_code?: string
          suspended?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      publish_jobs: {
        Row: {
          article_id: string | null
          created_at: string
          error: string | null
          generation_id: string | null
          id: string
          payload: Json
          platform: string
          post_url: string | null
          status: string
          target: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          error?: string | null
          generation_id?: string | null
          id?: string
          payload?: Json
          platform: string
          post_url?: string | null
          status?: string
          target?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          error?: string | null
          generation_id?: string | null
          id?: string
          payload?: Json
          platform?: string
          post_url?: string | null
          status?: string
          target?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publish_jobs_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publish_jobs_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
        ]
      }
      social_connections: {
        Row: {
          active: boolean
          config: Json
          created_at: string
          external_id: string | null
          id: string
          label: string
          platform: string
          secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          config?: Json
          created_at?: string
          external_id?: string | null
          id?: string
          label: string
          platform: string
          secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          config?: Json
          created_at?: string
          external_id?: string | null
          id?: string
          label?: string
          platform?: string
          secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grant_credits: {
        Args: {
          _amount: number
          _meta?: Json
          _reason: string
          _user_id: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      spend_credits: {
        Args: {
          _amount: number
          _meta?: Json
          _module_key: string
          _reason: string
          _user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
