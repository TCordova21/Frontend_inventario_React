import type { Diseno } from './diseno.types'
import type { Color } from './color.types'

export interface DisenoColor {
  id: number
  diseno_id: number
  color_id: number
  precio: string
  sku: string
  activo: boolean
  disenos?: Diseno
  colores?: Color
}

export interface CreateDisenoColorDto {
  diseno_id: number
  color_id: number
  precio: number
  sku: string
}