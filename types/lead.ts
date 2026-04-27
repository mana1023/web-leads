export type LeadEstado = 'nuevo' | 'contactado' | 'en_proceso' | 'vendido' | 'descartado'

export interface Lead {
  id: string
  nombre: string
  telefono: string | null
  direccion: string | null
  categoria: string
  tiene_web: boolean
  website_actual: string | null
  tipo_web_sugerida: string
  descripcion_propuesta: string
  estado: LeadEstado
  notas: string | null
  google_place_id: string | null
  created_at: string
  updated_at: string
}
