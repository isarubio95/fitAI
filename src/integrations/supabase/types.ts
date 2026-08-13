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
          es_publica: boolean
          fc_max: number | null
          fc_media: number | null
          fecha: string
          fecha_fin: string | null
          icono: string | null
          id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          comentarios?: string | null
          created_at?: string
          es_publica?: boolean
          fc_max?: number | null
          fc_media?: number | null
          fecha?: string
          fecha_fin?: string | null
          icono?: string | null
          id?: string
          titulo: string
          usuario_id?: string
        }
        Update: {
          comentarios?: string | null
          created_at?: string
          es_publica?: boolean
          fc_max?: number | null
          fc_media?: number | null
          fecha?: string
          fecha_fin?: string | null
          icono?: string | null
          id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      actividad_fc_sample: {
        Row: {
          actividad_id: string
          bpm: number
          created_at: string
          id: string
          t_epoch_ms: number
        }
        Insert: {
          actividad_id: string
          bpm: number
          created_at?: string
          id?: string
          t_epoch_ms: number
        }
        Update: {
          actividad_id?: string
          bpm?: number
          created_at?: string
          id?: string
          t_epoch_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "actividad_fc_sample_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
        ]
      }
      actividad_comentario: {
        Row: {
          actividad_id: string
          created_at: string
          id: string
          texto: string
          usuario_id: string
        }
        Insert: {
          actividad_id: string
          created_at?: string
          id?: string
          texto: string
          usuario_id?: string
        }
        Update: {
          actividad_id?: string
          created_at?: string
          id?: string
          texto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividad_comentario_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividad_comentario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
      }
      actividad_like: {
        Row: {
          actividad_id: string
          created_at: string
          id: string
          usuario_id: string
        }
        Insert: {
          actividad_id: string
          created_at?: string
          id?: string
          usuario_id?: string
        }
        Update: {
          actividad_id?: string
          created_at?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividad_like_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividad_like_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_sesion_comentario: {
        Row: {
          cardio_sesion_id: string
          created_at: string
          id: string
          texto: string
          usuario_id: string
        }
        Insert: {
          cardio_sesion_id: string
          created_at?: string
          id?: string
          texto: string
          usuario_id?: string
        }
        Update: {
          cardio_sesion_id?: string
          created_at?: string
          id?: string
          texto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sesion_comentario_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: false
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_sesion_comentario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_sesion_like: {
        Row: {
          cardio_sesion_id: string
          created_at: string
          id: string
          usuario_id: string
        }
        Insert: {
          cardio_sesion_id: string
          created_at?: string
          id?: string
          usuario_id?: string
        }
        Update: {
          cardio_sesion_id?: string
          created_at?: string
          id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_sesion_like_cardio_sesion_id_fkey"
            columns: ["cardio_sesion_id"]
            isOneToOne: false
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_sesion_like_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
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
      cardio_ruta: {
        Row: {
          cardio_disciplina_id: string | null
          created_at: string
          descripcion: string | null
          distancia_total_m: number | null
          elevacion_positiva_m: number | null
          id: string
          nombre: string
          origen_cardio_sesion_id: string | null
          usuario_id: string
        }
        Insert: {
          cardio_disciplina_id?: string | null
          created_at?: string
          descripcion?: string | null
          distancia_total_m?: number | null
          elevacion_positiva_m?: number | null
          id?: string
          nombre: string
          origen_cardio_sesion_id?: string | null
          usuario_id?: string
        }
        Update: {
          cardio_disciplina_id?: string | null
          created_at?: string
          descripcion?: string | null
          distancia_total_m?: number | null
          elevacion_positiva_m?: number | null
          id?: string
          nombre?: string
          origen_cardio_sesion_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cardio_ruta_cardio_disciplina_id_fkey"
            columns: ["cardio_disciplina_id"]
            isOneToOne: false
            referencedRelation: "cardio_disciplina"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cardio_ruta_origen_cardio_sesion_id_fkey"
            columns: ["origen_cardio_sesion_id"]
            isOneToOne: false
            referencedRelation: "cardio_sesion"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_ruta_punto: {
        Row: {
          cardio_ruta_id: string
          elevacion_m: number | null
          id: string
          lat: number
          lng: number
          orden: number
        }
        Insert: {
          cardio_ruta_id: string
          elevacion_m?: number | null
          id?: string
          lat: number
          lng: number
          orden: number
        }
        Update: {
          cardio_ruta_id?: string
          elevacion_m?: number | null
          id?: string
          lat?: number
          lng?: number
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "cardio_ruta_punto_cardio_ruta_id_fkey"
            columns: ["cardio_ruta_id"]
            isOneToOne: false
            referencedRelation: "cardio_ruta"
            referencedColumns: ["id"]
          },
        ]
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
          superset_id: string | null
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
          superset_id?: string | null
          tipo_ejercicio_id?: string | null
          usuario_ejercicio_id?: string | null
          usuario_id?: string
        }
        Update: {
          actividad_id?: string
          created_at?: string
          descanso?: number | null
          id?: string
          registro_series?: string
          rep_range?: string | null
          rir_objetivo?: number | null
          superset_id?: string | null
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
      logro: {
        Row: {
          categoria: string | null
          codigo: string | null
          created_at: string
          descripcion: string
          icono: string
          id: string
          meta: number
          nivel: string | null
          nombre: string
          orden: number
          tipo: string
          xp_recompensa: number
        }
        Insert: {
          categoria?: string | null
          codigo?: string | null
          created_at?: string
          descripcion: string
          icono: string
          id?: string
          meta?: number
          nivel?: string | null
          nombre: string
          orden?: number
          tipo: string
          xp_recompensa?: number
        }
        Update: {
          categoria?: string | null
          codigo?: string | null
          created_at?: string
          descripcion?: string
          icono?: string
          id?: string
          meta?: number
          nivel?: string | null
          nombre?: string
          orden?: number
          tipo?: string
          xp_recompensa?: number
        }
        Relationships: []
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
          usuario_id?: string
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
          fc_max: number | null
          fc_reposo: number | null
          fecha_nacimiento: string | null
          ftp_w: number | null
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
          fc_max?: number | null
          fc_reposo?: number | null
          fecha_nacimiento?: string | null
          ftp_w?: number | null
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
          fc_max?: number | null
          fc_reposo?: number | null
          fecha_nacimiento?: string | null
          ftp_w?: number | null
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
      rutina: {
        Row: {
          created_at: string
          descripcion: string | null
          duracion_minutos: number | null
          es_plantilla: boolean | null
          grupo_muscular: string | null
          icono: string
          id: string
          nivel: string | null
          nombre: string
          orden: number | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number | null
          es_plantilla?: boolean | null
          grupo_muscular?: string | null
          icono?: string
          id?: string
          nivel?: string | null
          nombre: string
          orden?: number | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          duracion_minutos?: number | null
          es_plantilla?: boolean | null
          grupo_muscular?: string | null
          icono?: string
          id?: string
          nivel?: string | null
          nombre?: string
          orden?: number | null
          usuario_id?: string | null
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
          superset_id: string | null
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
          superset_id?: string | null
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
          superset_id?: string | null
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
          usuario_id?: string
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
            foreignKeyName: "rutina_programada_actividad_id_fkey"
            columns: ["actividad_id"]
            isOneToOne: false
            referencedRelation: "actividad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rutina_programada_rutina_id_fkey"
            columns: ["rutina_id"]
            isOneToOne: false
            referencedRelation: "rutina"
            referencedColumns: ["id"]
          },
        ]
      }
      seguimiento: {
        Row: {
          created_at: string
          id: string
          seguido_id: string
          seguidor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          seguido_id: string
          seguidor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          seguido_id?: string
          seguidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_seguido_id_fkey"
            columns: ["seguido_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_seguidor_id_fkey"
            columns: ["seguidor_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
      }
      serie: {
        Row: {
          completed: boolean | null
          created_at: string
          descanso: number | null
          duracion_seg: number | null
          ejercicio_id: string
          id: string
          numero_serie: number
          peso_kg: number
          repeticiones: number
          rir: number | null
          ritmo_seg_km: number | null
          usuario_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          descanso?: number | null
          duracion_seg?: number | null
          ejercicio_id: string
          id?: string
          numero_serie?: number
          peso_kg?: number
          repeticiones?: number
          rir?: number | null
          ritmo_seg_km?: number | null
          usuario_id?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          descanso?: number | null
          duracion_seg?: number | null
          ejercicio_id?: string
          id?: string
          numero_serie?: number
          peso_kg?: number
          repeticiones?: number
          rir?: number | null
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
          created_at: string
          dificultad: string | null
          equipment: string | null
          gif_url: string | null
          grupo_muscular: string | null
          id: string
          imagen: string | null
          instructions: string[] | null
          musculos_involucrados: string[] | null
          nombre: string
          registro_series: string
          tipo: string | null
        }
        Insert: {
          created_at?: string
          dificultad?: string | null
          equipment?: string | null
          gif_url?: string | null
          grupo_muscular?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          musculos_involucrados?: string[] | null
          nombre: string
          registro_series?: string
          tipo?: string | null
        }
        Update: {
          created_at?: string
          dificultad?: string | null
          equipment?: string | null
          gif_url?: string | null
          grupo_muscular?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          musculos_involucrados?: string[] | null
          nombre?: string
          registro_series?: string
          tipo?: string | null
        }
        Relationships: []
      }
      usuario_ejercicio: {
        Row: {
          created_at: string
          descripcion: string | null
          dificultad: string | null
          equipment: string | null
          gif_url: string | null
          grupo_muscular: string | null
          id: string
          imagen: string | null
          instructions: string[] | null
          musculos_involucrados: string[] | null
          nombre: string
          registro_series: string
          tipo: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          dificultad?: string | null
          equipment?: string | null
          gif_url?: string | null
          grupo_muscular?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          musculos_involucrados?: string[] | null
          nombre: string
          registro_series?: string
          tipo?: string | null
          usuario_id?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          dificultad?: string | null
          equipment?: string | null
          gif_url?: string | null
          grupo_muscular?: string | null
          id?: string
          imagen?: string | null
          instructions?: string[] | null
          musculos_involucrados?: string[] | null
          nombre?: string
          registro_series?: string
          tipo?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      usuario_logro: {
        Row: {
          fecha_desbloqueo: string
          id: string
          logro_id: string
          usuario_id: string
        }
        Insert: {
          fecha_desbloqueo?: string
          id?: string
          logro_id: string
          usuario_id?: string
        }
        Update: {
          fecha_desbloqueo?: string
          id?: string
          logro_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_logro_logro_id_fkey"
            columns: ["logro_id"]
            isOneToOne: false
            referencedRelation: "logro"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuario_logro_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfil"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_data: { Args: { p_user_id: string }; Returns: undefined }
      get_exercise_daily_best: {
        Args: { p_tipo_ejercicio_id: string; p_months?: number }
        Returns: {
          day: string
          weight: number
          reps: number
          one_rep_max: number
        }[]
      }
      gym_normalize_tipo_nombre: { Args: { p_nombre: string }; Returns: string }
      list_exercises_with_history: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          last_performed: string
        }[]
      }
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
