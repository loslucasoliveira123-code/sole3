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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      casais: {
        Row: {
          created_at: string
          criado_por: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          criado_por: string
          id?: string
          nome?: string
        }
        Update: {
          created_at?: string
          criado_por?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      casal_membros: {
        Row: {
          casal_id: string
          created_at: string
          nome: string
          user_id: string
        }
        Insert: {
          casal_id: string
          created_at?: string
          nome?: string
          user_id: string
        }
        Update: {
          casal_id?: string
          created_at?: string
          nome?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "casal_membros_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
      convites: {
        Row: {
          casal_id: string
          codigo: string
          created_at: string
          criado_por: string
          id: string
          usado_em: string | null
          usado_por: string | null
        }
        Insert: {
          casal_id: string
          codigo?: string
          created_at?: string
          criado_por: string
          id?: string
          usado_em?: string | null
          usado_por?: string | null
        }
        Update: {
          casal_id?: string
          codigo?: string
          created_at?: string
          criado_por?: string
          id?: string
          usado_em?: string | null
          usado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos: {
        Row: {
          casal_id: string
          categoria: string
          created_at: string
          criado_por: string
          data: string
          id: string
          pagador: string
          projeto_id: string | null
          tipo: string
          titulo: string
          valor: number
        }
        Insert: {
          casal_id: string
          categoria?: string
          created_at?: string
          criado_por?: string
          data?: string
          id?: string
          pagador?: string
          projeto_id?: string | null
          tipo: string
          titulo: string
          valor: number
        }
        Update: {
          casal_id?: string
          categoria?: string
          created_at?: string
          criado_por?: string
          data?: string
          id?: string
          pagador?: string
          projeto_id?: string | null
          tipo?: string
          titulo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          aporte: number
          atual: number
          casal_id: string
          created_at: string
          id: string
          nome: string
          objetivo: number
          prazo: string | null
        }
        Insert: {
          aporte?: number
          atual?: number
          casal_id: string
          created_at?: string
          id?: string
          nome: string
          objetivo: number
          prazo?: string | null
        }
        Update: {
          aporte?: number
          atual?: number
          casal_id?: string
          created_at?: string
          id?: string
          nome?: string
          objetivo?: number
          prazo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projetos: {
        Row: {
          casal_id: string
          created_at: string
          descricao: string
          id: string
          nome: string
          orcamento: number
          prazo: string | null
          status: string
        }
        Insert: {
          casal_id: string
          created_at?: string
          descricao?: string
          id?: string
          nome: string
          orcamento?: number
          prazo?: string | null
          status?: string
        }
        Update: {
          casal_id?: string
          created_at?: string
          descricao?: string
          id?: string
          nome?: string
          orcamento?: number
          prazo?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_casal_id_fkey"
            columns: ["casal_id"]
            isOneToOne: false
            referencedRelation: "casais"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceitar_convite: { Args: { _codigo: string }; Returns: string }
      is_membro: { Args: { _casal: string }; Returns: boolean }
      meu_casal: { Args: never; Returns: string }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
