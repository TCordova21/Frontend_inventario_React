import api from '../lib/axios'
import type { Inventario, CreateInventarioDto } from '../types/inventario.types'

/**
 * Obtiene todo el inventario cargado con sus relaciones (disenos, nodos, sucursales)
 */
export const getInventario = async (): Promise<Inventario[]> => {
  const { data } = await api.get<Inventario[]>('/inventario')
  return data
}

/**
 * Crea o actualiza un registro de stock.
 * Si es Local, diseno_id debe ser null y nodo_id es obligatorio.
 * Si es Matriz, diseno_id es obligatorio.
 */
export const upsertInventario = async (dto: CreateInventarioDto): Promise<Inventario> => {
  const { data } = await api.post<Inventario>('/inventario', dto)
  return data
}

/**
 * Obtiene los productos cuya cantidad es menor o igual al stock_minimo.
 * Útil para alertas en el Dashboard.
 */
export const getLowStock = async (): Promise<Inventario[]> => {
  const { data } = await api.get<Inventario[]>('/inventario/low-stock')
  return data
}