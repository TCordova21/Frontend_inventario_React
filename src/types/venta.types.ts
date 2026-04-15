import type { Diseno } from './diseno.types'

export interface Venta {
  id: number
  fecha: string
  total: string
}

export interface DetalleVenta {
  id: number
  venta_id: number
  cantidad: number
  precio_unitario: string
  diseno_id: number | null
  disenos: Diseno | null
}

export interface VentaDetalle extends Venta {
  detalle_ventas: DetalleVenta[]
}

export interface CreateDetalleVentaDto {
  diseno_id: number
  cantidad: number
  precio_unitario: number
}

export interface CreateVentaDto {
  detalles: CreateDetalleVentaDto[]
  usuario_id: number
  sucursal_id: number
}


export interface DetalleVenta {
  id: number
  venta_id: number
  cantidad: number
  precio_unitario: string
  diseno_id: number | null
  disenos: Diseno | null
}

export interface Venta {
  id: number
  fecha: string
  total: string
  detalle_ventas: DetalleVenta[]
}

export interface CreateDetalleVentaDto {
  diseno_id: number
  cantidad: number
  precio_unitario: number
}

export interface CreateVentaDto {
  detalles: CreateDetalleVentaDto[]
  usuario_id: number
  sucursal_id: number
}