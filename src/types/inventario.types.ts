import type { Diseno } from './diseno.types'

export interface Sucursal {
  id: number
  nombre: string
  tipo: string // 'Matriz' o 'Local'
  direccion?: string
  activo: boolean
}

// Añadimos la interfaz de Nodo si no la tenías, 
// ya que es vital para el inventario de los locales
export interface Nodo {
  id: number
  nombre: string
  tipo: string
}

export interface Inventario {
  id: number
  sucursal_id: number
  cantidad: number
  stock_minimo: number
  stock_maximo: number | null
  actualizado_en: string
  
  // Claves foráneas (pueden ser null según el tipo de sucursal)
  diseno_id: number | null
  nodo_id: number | null 

  // Relaciones cargadas desde Prisma (include)
  disenos?: Diseno | null
  nodos?: Nodo | null
  sucursales: Sucursal
}

export interface CreateInventarioDto {
  sucursal_id: number
  cantidad: number
  diseno_id?: number | null // Opcional porque en locales se manda null
  nodo_id?: number          // Necesario para determinar el stock global
  stock_minimo?: number
  stock_maximo?: number
}