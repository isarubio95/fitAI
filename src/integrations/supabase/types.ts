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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actividad: {
        Row: {
          comentarios: string | null
          created_at: string
          fecha: string
          id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          comentarios?: string | null
          created_at?: string
          fecha?: string
          id?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          comentarios?: string | null
          created_at?: string
          fecha?: string
          id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      ejercicio: {
        Row: {
          actividad_id: string
          created_at: string
          id: string
          tipo_ejercicio_id: string
          usuario_id: string
        }
        Insert: {
          actividad_id: string
          created_at?: string
          id?: string
          tipo_ejercicio_id: string
          usuario_id: string
        }
        Update: {
          actividad_id?: string
          created_at?: string
          id?: string
          tipo_ejercicio_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ejercicio_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ejercicio_tipo_ejercicio_id_fkey"
            columns: ["tipo_ejercicio_id"]
            isOneToOne: false
            referencedRelation: "tipo_ejercicio"
            referencedColumns: ["id"]
          },
        ]
      }
      rutina: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          usuario_id?: string
        }
        Relationships: []
      }
      rutina_ejercicio: {
        Row: {
          created_at: string
          id: string
          orden: number
          repes_max: number
          repes_min: number
          rutina_id: string
          series_objetivo: number
          tipo_ejercicio_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          orden?: number
          repes_max?: number
          repes_min?: number
          rutina_id: string
          series_objetivo?: number
          tipo_ejercicio_id: string
        }
        Update: {
          created_at?: string
          id?: string
          orden?: number
          repes_max?: number
          repes_min?: number
          rutina_id?: string
          series_objetivo?: number
          tipo_ejercicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rutina_ejercicio_rutina_id_fkey"
            columns: ["rutina_id"]
            isOneToOne: false
            referencedRelation: "rutina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutina_ejercicio_tipo_ejercicio_id_fkey"
            columns: ["tipo_ejercicio_id"]
            isOneToOne: false
            referencedRelation: "tipo_ejercicio"
            referencedColumns: ["id"]
          },
        ]
      }
      serie: {
        Row: {
          created_at: string
          ejercicio_id: string
          id: string
          numero_serie: number
          peso_kg: number
          repeticiones: number
          usuario_id: string
        }
        Insert: {
          created_at?: string
          ejercicio_id: string
          id?: string
          numero_serie?: number
          peso_kg?: number
          repeticiones?: number
          usuario_id: string
        }
        Update: {
          created_at?: string
          ejercicio_id?: string
          id?: string
          numero_serie?: number
          peso_kg?: number
          repeticiones?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "serie_ejercicio_id_fkey"
            columns: ["ejercicio_id"]
            isOneToOne: false
            referencedRelation: "ejercicio"
            referencedColumns: ["id"]
          },
        ]
      }
      tipo_ejercicio: {
        Row: {
          body_part: string | null
          created_at: string
          descripcion: string | null
          equipment: string | null
          external_id: string | null
          gif_url: string | null
          id: string
          imagen: string | null
          instructions: string[] | null
          nombre: string
        }
        Insert: {
          body_part?: string | null
          created_at?: string
          descripcion?: string | null
          equipment?: string | null
          external_id?: string | null
          gif_url?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          nombre: string
        }
        Update: {
          body_part?: string | null
          created_at?: string
          descripcion?: string | null
          equipment?: string | null
          external_id?: string | null
          gif_url?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
