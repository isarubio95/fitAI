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
          fecha_fin: string | null
          id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          comentarios?: string | null
          created_at?: string
          fecha?: string
          fecha_fin?: string | null
          id?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          comentarios?: string | null
          created_at?: string
          fecha?: string
          fecha_fin?: string | null
          id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      cardio_bloque: {
        Row: {
          calorias: number | null
          cardio_sesion_id: string
          created_at: string
          distancia_m: number | null
          duracion_seg: number | null
          elevacion_m: number | null
          fc_max: number | null
          fc_media: number | null
          id: string
          orden: number
          tipo_bloque: string
        }
        Insert: {
          calorias?: number | null
          cardio_sesion_id: string
          created_at?: string
          distancia_m?: number | null
          duracion_seg?: number | null
          elevacion_m?: number | null
          fc_max?: number | null
          fc_media?: number | null
          id?: string
          orden?: number
          tipo_bloque?: string
        }
        Update: {
          calorias?: number | null
          cardio_sesion_id?: string
          created_at?: string
          distancia_m?: number | null
          duracion_seg?: number | null
          elevacion_m?: number | null
          fc_max?: number | null
          fc_media?: number | null
          id?: string
          orden?: number
          tipo_bloque?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_bloque_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: false
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_disciplina: {
        Row: {
          activo: boolean
          codigo: string
          created_at: string
          icono: string | null
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          activo?: boolean
          codigo: string
          created_at?: string
          icono?: string | null
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          activo?: boolean
          codigo?: string
          created_at?: string
          icono?: string | null
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: []
      }
      cardio_rutina: {
        Row: {
          cardio_disciplina_id: string | null
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number | null
          usuario_id: string
        }
        Insert: {
          cardio_disciplina_id?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number | null
          usuario_id?: string
        }
        Update: {
          cardio_disciplina_id?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_rutina_cardio_disciplina_id_fkey"
            columns: ["cardio_disciplina_id"]
            isOneToOne: false
            referencedRelation: "cardio_disciplina"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_rutina_bloque: {
        Row: {
          cardio_rutina_id: string
          distancia_objetivo_m: number | null
          duracion_objetivo_seg: number | null
          fc_objetivo: number | null
          id: string
          orden: number
          ritmo_objetivo_seg_km: number | null
          tipo_bloque: string
        }
        Insert: {
          cardio_rutina_id: string
          distancia_objetivo_m?: number | null
          duracion_objetivo_seg?: number | null
          fc_objetivo?: number | null
          id?: string
          orden?: number
          ritmo_objetivo_seg_km?: number | null
          tipo_bloque?: string
        }
        Update: {
          cardio_rutina_id?: string
          distancia_objetivo_m?: number | null
          duracion_objetivo_seg?: number | null
          fc_objetivo?: number | null
          id?: string
          orden?: number
          ritmo_objetivo_seg_km?: number | null
          tipo_bloque?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_rutina_bloque_cardio_rutina_id_fkey"
            columns: ["cardio_rutina_id"]
            isOneToOne: false
            referencedRelation: "cardio_rutina"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_rutina_programada: {
        Row: {
          cardio_rutina_id: string
          cardio_sesion_id: string | null
          created_at: string
          fecha_programada: string
          id: string
          usuario_id: string
        }
        Insert: {
          cardio_rutina_id: string
          cardio_sesion_id?: string | null
          created_at?: string
          fecha_programada: string
          id?: string
          usuario_id?: string
        }
        Update: {
          cardio_rutina_id?: string
          cardio_sesion_id?: string | null
          created_at?: string
          fecha_programada?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_rutina_programada_cardio_rutina_id_fkey"
            columns: ["cardio_rutina_id"]
            isOneToOne: false
            referencedRelation: "cardio_rutina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_rutina_programada_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: false
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_sesion: {
        Row: {
          cardio_disciplina_id: string | null
          comentarios: string | null
          created_at: string
          /** Legacy; omitida en muchas BDs (solo cardio_disciplina_id). */
          deporte?: string | null
          es_publica: boolean
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          cardio_disciplina_id?: string | null
          comentarios?: string | null
          created_at?: string
          es_publica?: boolean
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          titulo: string
          usuario_id?: string
        }
        Update: {
          cardio_disciplina_id?: string | null
          comentarios?: string | null
          created_at?: string
          es_publica?: boolean
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sesion_cardio_disciplina_id_fkey"
            columns: ["cardio_disciplina_id"]
            isOneToOne: false
            referencedRelation: "cardio_disciplina"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_sesion_cycling: {
        Row: {
          cadencia_media_rpm: number | null
          cardio_sesion_id: string
          created_at: string
          desnivel_positivo_m: number | null
          potencia_media_w: number | null
          potencia_normalizada_w: number | null
          tipo_bici: string | null
        }
        Insert: {
          cadencia_media_rpm?: number | null
          cardio_sesion_id: string
          created_at?: string
          desnivel_positivo_m?: number | null
          potencia_media_w?: number | null
          potencia_normalizada_w?: number | null
          tipo_bici?: string | null
        }
        Update: {
          cadencia_media_rpm?: number | null
          cardio_sesion_id?: string
          created_at?: string
          desnivel_positivo_m?: number | null
          potencia_media_w?: number | null
          potencia_normalizada_w?: number | null
          tipo_bici?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sesion_cycling_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: true
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_sesion_running: {
        Row: {
          cadencia_media_spm: number | null
          cardio_sesion_id: string
          created_at: string
          desnivel_positivo_m: number | null
          ritmo_medio_seg_km: number | null
          zancada_media_cm: number | null
        }
        Insert: {
          cadencia_media_spm?: number | null
          cardio_sesion_id: string
          created_at?: string
          desnivel_positivo_m?: number | null
          ritmo_medio_seg_km?: number | null
          zancada_media_cm?: number | null
        }
        Update: {
          cadencia_media_spm?: number | null
          cardio_sesion_id?: string
          created_at?: string
          desnivel_positivo_m?: number | null
          ritmo_medio_seg_km?: number | null
          zancada_media_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sesion_running_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: true
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_track: {
        Row: {
          cardio_sesion_id: string
          created_at: string
          distancia_total_m: number | null
          duracion_total_seg: number | null
          elevacion_positiva_m: number | null
          fuente: string | null
          id: string
        }
        Insert: {
          cardio_sesion_id: string
          created_at?: string
          distancia_total_m?: number | null
          duracion_total_seg?: number | null
          elevacion_positiva_m?: number | null
          fuente?: string | null
          id?: string
        }
        Update: {
          cardio_sesion_id?: string
          created_at?: string
          distancia_total_m?: number | null
          duracion_total_seg?: number | null
          elevacion_positiva_m?: number | null
          fuente?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_track_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: true
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_track_point: {
        Row: {
          cadencia: number | null
          cardio_track_id: string
          created_at: string
          elevacion_m: number | null
          fc: number | null
          id: string
          lat: number
          lng: number
          orden: number
          potencia_w: number | null
          timestamp_utc: string | null
          velocidad_m_s: number | null
        }
        Insert: {
          cadencia?: number | null
          cardio_track_id: string
          created_at?: string
          elevacion_m?: number | null
          fc?: number | null
          id?: string
          lat: number
          lng: number
          orden: number
          potencia_w?: number | null
          timestamp_utc?: string | null
          velocidad_m_s?: number | null
        }
        Update: {
          cadencia?: number | null
          cardio_track_id?: string
          created_at?: string
          elevacion_m?: number | null
          fc?: number | null
          id?: string
          lat?: number
          lng?: number
          orden?: number
          potencia_w?: number | null
          timestamp_utc?: string | null
          velocidad_m_s?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cardio_track_point_cardio_track_id_fkey"
            columns: ["cardio_track_id"]
            isOneToOne: false
            referencedRelation: "cardio_track"
            referencedColumns: ["id"]
          },
        ]
      }
      ejercicio: {
        Row: {
          actividad_id: string
          created_at: string
          descanso: number | null
          id: string
          registro_series: string
          rep_range: string | null
          rir_objetivo: number | null
          tipo_ejercicio_id: string | null
          usuario_ejercicio_id: string | null
          usuario_id: string
        }
        Insert: {
          actividad_id: string
          created_at?: string
          descanso?: number | null
          id?: string
          registro_series?: string
          rep_range?: string | null
          rir_objetivo?: number | null
          tipo_ejercicio_id?: string | null
          usuario_ejercicio_id?: string | null
          usuario_id: string
        }
        Update: {
          actividad_id?: string
          created_at?: string
          descanso?: number | null
          id?: string
          registro_series?: string
          rep_range?: string | null
          rir_objetivo?: number | null
          tipo_ejercicio_id?: string | null
          usuario_ejercicio_id?: string | null
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
          {
            foreignKeyName: "ejercicio_usuario_ejercicio_id_fkey"
            columns: ["usuario_ejercicio_id"]
            isOneToOne: false
            referencedRelation: "usuario_ejercicio"
            referencedColumns: ["id"]
          },
        ]
      }
      medidas: {
        Row: {
          brazo: number | null
          cintura: number | null
          created_at: string
          fecha: string
          foto_espalda: string | null
          foto_frontal: string | null
          grasa: number | null
          id: string
          notas: string | null
          pecho: number | null
          peso: number | null
          pierna: number | null
          usuario_id: string
        }
        Insert: {
          brazo?: number | null
          cintura?: number | null
          created_at?: string
          fecha?: string
          foto_espalda?: string | null
          foto_frontal?: string | null
          grasa?: number | null
          id?: string
          notas?: string | null
          pecho?: number | null
          peso?: number | null
          pierna?: number | null
          usuario_id: string
        }
        Update: {
          brazo?: number | null
          cintura?: number | null
          created_at?: string
          fecha?: string
          foto_espalda?: string | null
          foto_frontal?: string | null
          grasa?: number | null
          id?: string
          notas?: string | null
          pecho?: number | null
          peso?: number | null
          pierna?: number | null
          usuario_id?: string
        }
        Relationships: []
      }
      perfil: {
        Row: {
          avatar_url: string | null
          comunidad_publica_actividad: boolean
          created_at: string
          es_premium: boolean
          id: string
          nivel: number
          racha_actual: number
          racha_maxima: number
          ultima_actividad_fecha: string | null
          username: string | null
          xp_total: number
        }
        Insert: {
          avatar_url?: string | null
          comunidad_publica_actividad?: boolean
          created_at?: string
          es_premium?: boolean
          id?: string
          nivel?: number
          racha_actual?: number
          racha_maxima?: number
          ultima_actividad_fecha?: string | null
          username?: string | null
          xp_total?: number
        }
        Update: {
          avatar_url?: string | null
          comunidad_publica_actividad?: boolean
          created_at?: string
          es_premium?: boolean
          id?: string
          nivel?: number
          racha_actual?: number
          racha_maxima?: number
          ultima_actividad_fecha?: string | null
          username?: string | null
          xp_total?: number
        }
        Relationships: []
      }
      plan_generado_ia: {
        Row: {
          created_at: string
          id: string
          prompt: string
          respuesta: Json
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          respuesta: Json
          usuario_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          respuesta?: Json
          usuario_id?: string
        }
        Relationships: []
      }
      rutina: {
        Row: {
          created_at: string
          descripcion: string | null
          duracion_minutos: number | null
          es_plantilla: boolean | null
          grupo_muscular: string | null
          id: string
          nivel: string | null
          nombre: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number | null
          es_plantilla?: boolean | null
          grupo_muscular?: string | null
          id?: string
          nivel?: string | null
          nombre: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number | null
          es_plantilla?: boolean | null
          grupo_muscular?: string | null
          id?: string
          nivel?: string | null
          nombre?: string
          usuario_id?: string
        }
        Relationships: []
      }
      rutina_ejercicio: {
        Row: {
          created_at: string
          descanso: number | null
          duracion_objetivo_seg: number | null
          id: string
          orden: number
          registro_series: string
          repes_max: number
          repes_min: number
          rir: number | null
          ritmo_objetivo_seg_km: number | null
          rutina_id: string
          series_objetivo: number
          tipo_ejercicio_id: string | null
          usuario_ejercicio_id: string | null
        }
        Insert: {
          created_at?: string
          descanso?: number | null
          duracion_objetivo_seg?: number | null
          id?: string
          orden?: number
          registro_series?: string
          repes_max?: number
          repes_min?: number
          rir?: number | null
          ritmo_objetivo_seg_km?: number | null
          rutina_id: string
          series_objetivo?: number
          tipo_ejercicio_id?: string | null
          usuario_ejercicio_id?: string | null
        }
        Update: {
          created_at?: string
          descanso?: number | null
          duracion_objetivo_seg?: number | null
          id?: string
          orden?: number
          registro_series?: string
          repes_max?: number
          repes_min?: number
          rir?: number | null
          ritmo_objetivo_seg_km?: number | null
          rutina_id?: string
          series_objetivo?: number
          tipo_ejercicio_id?: string | null
          usuario_ejercicio_id?: string | null
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
          {
            foreignKeyName: "rutina_ejercicio_usuario_ejercicio_id_fkey"
            columns: ["usuario_ejercicio_id"]
            isOneToOne: false
            referencedRelation: "usuario_ejercicio"
            referencedColumns: ["id"]
          },
        ]
      }
      rutina_programada: {
        Row: {
          actividad_id: string | null
          created_at: string
          fecha_programada: string
          id: string
          rutina_id: string
          usuario_id: string
        }
        Insert: {
          actividad_id?: string | null
          created_at?: string
          fecha_programada: string
          id?: string
          rutina_id: string
          usuario_id: string
        }
        Update: {
          actividad_id?: string | null
          created_at?: string
          fecha_programada?: string
          id?: string
          rutina_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rutina_programada_rutina_id_fkey"
            columns: ["rutina_id"]
            isOneToOne: false
            referencedRelation: "rutina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutina_programada_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
        ]
      }
      serie: {
        Row: {
          completed: boolean
          created_at: string
          duracion_seg: number | null
          ejercicio_id: string
          id: string
          numero_serie: number
          peso_kg: number
          repeticiones: number
          ritmo_seg_km: number | null
          usuario_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duracion_seg?: number | null
          ejercicio_id: string
          id?: string
          numero_serie?: number
          peso_kg?: number
          repeticiones?: number
          ritmo_seg_km?: number | null
          usuario_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duracion_seg?: number | null
          ejercicio_id?: string
          id?: string
          numero_serie?: number
          peso_kg?: number
          repeticiones?: number
          ritmo_seg_km?: number | null
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
          musculos_involucrados: string[] | null
          created_at: string
          descripcion: string | null
          dificultad: string | null
          equipment: string | null
          external_id: string | null
          gif_url: string | null
          grupo_muscular: string | null
          id: string
          imagen: string | null
          instructions: string[] | null
          nombre: string
          registro_series: string
          tipo: string | null
        }
        Insert: {
          musculos_involucrados?: string[] | null
          created_at?: string
          descripcion?: string | null
          dificultad?: string | null
          equipment?: string | null
          external_id?: string | null
          gif_url?: string | null
          grupo_muscular?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          nombre: string
          registro_series?: string
          tipo?: string | null
        }
        Update: {
          musculos_involucrados?: string[] | null
          created_at?: string
          descripcion?: string | null
          dificultad?: string | null
          equipment?: string | null
          external_id?: string | null
          gif_url?: string | null
          grupo_muscular?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          nombre?: string
          registro_series?: string
          tipo?: string | null
        }
        Relationships: []
      }
      usuario_ejercicio: {
        Row: {
          id: string
          usuario_id: string
          nombre: string
          descripcion: string | null
          imagen: string | null
          created_at: string
          gif_url: string | null
          musculos_involucrados: string[] | null
          equipment: string | null
          instructions: string[] | null
          tipo: string | null
          grupo_muscular: string | null
          dificultad: string | null
          registro_series: string
        }
        Insert: {
          id?: string
          usuario_id: string
          nombre: string
          descripcion?: string | null
          imagen?: string | null
          created_at?: string
          gif_url?: string | null
          musculos_involucrados?: string[] | null
          equipment?: string | null
          instructions?: string[] | null
          tipo?: string | null
          grupo_muscular?: string | null
          dificultad?: string | null
          registro_series?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          nombre?: string
          descripcion?: string | null
          imagen?: string | null
          created_at?: string
          gif_url?: string | null
          musculos_involucrados?: string[] | null
          equipment?: string | null
          instructions?: string[] | null
          tipo?: string | null
          grupo_muscular?: string | null
          dificultad?: string | null
          registro_series?: string
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
