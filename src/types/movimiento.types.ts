import type { Diseno } from './diseno.types'

export type TipoMovimiento = 'TRASLADO' | 'VENTA' | 'AJUSTE' | 'ENTRADA' | 'DEVOLUCION'

export interface Movimiento {
  id: number
  sucursal_origen_id: number
  sucursal_destino_id: number | null
  tipo_movimiento: TipoMovimiento | string
  cantidad: number
  referencia: string
  observacion: string | null
  fecha: string
  usuario_id: number | null
  diseno_id: number | null
  disenos: Diseno | null
}

export interface CreateMovimientoDto {
  diseno_id: number
  sucursal_origen_id: number
  sucursal_destino_id?: number
  tipo_movimiento: string
  cantidad: number
  referencia: string
  observacion?: string
}