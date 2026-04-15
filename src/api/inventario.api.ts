import api from '../lib/axios'
import type { Inventario, CreateInventarioDto } from '../types/inventario.types'

export const getInventario = async (): Promise<Inventario[]> => {
  const { data } = await api.get<Inventario[]>('/inventario')
  return data
}

export const upsertInventario = async (dto: CreateInventarioDto): Promise<Inventario> => {
  const { data } = await api.post<Inventario>('/inventario', dto)
  return data
}