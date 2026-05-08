import type { Diseno } from './diseno.types'

export type TipoMovimiento = 'TRASLADO' | 'VENTA' | 'AJUSTE' | 'ENTRADA' | 'DEVOLUCION' | 'RETORNO_MATRIZ'
export type EstadoMovimiento = 'PENDIENTE' | 'COMPLETADO' | 'CANCELADO'

export interface Movimiento {
  usuarios_movimientos_inventario_usuario_confirmacion_idTousuarios: any
  id: number
  sucursal_origen_id: number | null
  sucursal_destino_id: number | null
  tipo_movimiento: TipoMovimiento
  estado: EstadoMovimiento
  cantidad: number
  
  // --- Campos de confirmación ---
  cantidad_confirmada: number | null
  fecha_confirmacion: string | null
  usuario_confirmacion_id: number | null // ID del usuario que confirma
  
  referencia?: string | null
  observacion?: string | null
  fecha: string
  usuario_id: number | null
  
  // Relaciones
  diseno_id: number | null
  nodo_id: number | null 

  // Usuario que creó el movimiento
  usuarios?: {
    nombre: string
  }

  // --- NUEVO: Usuario que confirmó el movimiento ---
  usuario_confirmacion?: {
    nombre: string
  } | null

  // Relaciones de Objetos
  disenos: Diseno | null
  nodos?: {
    nombre: string
    imagen: string
  } | null
  
  sucursales_movimientos_inventario_sucursal_origen_idTosucursales?: {
    nombre: string
  }
  sucursales_movimientos_inventario_sucursal_destino_idTosucursales?: {
    nombre: string
  }
}

export interface CreateMovimientoDto {
  diseno_id: number | null
  nodo_id?: number | null
  sucursal_origen_id?: number
  sucursal_destino_id?: number
  tipo_movimiento: TipoMovimiento
  cantidad: number
  referencia?: string | null
  observacion?: string
  usuario_id?: number
}

// --- DTO de confirmación actualizado ---
export interface ConfirmarMovimientoDto {
  cantidad_confirmada: number
  usuario_confirmacion_id: number // Obligatorio para saber quién recibió
  fecha_confirmacion?: string
  observacion?: string
}