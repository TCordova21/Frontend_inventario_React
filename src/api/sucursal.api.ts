import api from '../lib/axios'
import type { Sucursal, CreateSucursalDto } from '../types/sucursal.type'

export const getSucursales = async (): Promise<Sucursal[]> => {
  const { data } = await api.get<Sucursal[]>('/sucursales')
  return data
}

export const createSucursal = async (dto: CreateSucursalDto): Promise<Sucursal> => {
  const { data } = await api.post<Sucursal>('/sucursales', dto)
  return data
}

