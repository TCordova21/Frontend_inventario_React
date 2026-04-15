import type { Color } from './color.types'

export interface Subcategoria {
  id: number
  nombre: string
  categoria_id: number
}

export interface DisenoColor {
  id: number
  diseno_id: number
  color_id: number
  descripcion?: string
  colores?: Color
}

export interface Diseno {
  id: number
  nombre: string
  imagen?: string
  descripcion?: string
  codigo?: string
  activo: boolean
  subcategoria_id?: number
  precio?: string | null
  subcategorias?: Subcategoria
  diseno_color?: DisenoColor[]
}

export interface CreateDisenoDto {
  nombre: string
  imagen?: string
  descripcion?: string
  codigo?: string
  subcategoria_id: number
}

export interface UpdateDisenoDto {
  nombre?: string
  imagen?: string
  descripcion?: string
  codigo?: string
  precio?: number
}