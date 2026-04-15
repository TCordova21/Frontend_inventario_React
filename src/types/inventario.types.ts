import type { Diseno } from './diseno.types'

export interface Sucursal {
  id: number
  nombre: string
  tipo: string
  direccion?: string
  activo: boolean
}

export interface Inventario {
  id: number
  sucursal_id: number
  cantidad: number
  stock_minimo: number
  stock_maximo: number | null
  actualizado_en: string
  diseno_id: number | null
  disenos: Diseno | null
  sucursales: Sucursal
}

export interface CreateInventarioDto {
  diseno_id: number
  sucursal_id: number
  cantidad: number
  stock_minimo?: number
  stock_maximo?: number
}