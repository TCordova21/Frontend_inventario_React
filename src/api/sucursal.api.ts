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

export const updateSucursal = async (id: number, dto: Partial<CreateSucursalDto>): Promise<Sucursal> => {
  const { data } = await api.patch<Sucursal>(`/sucursales/${id}`, dto)
  return data
}

export const deleteSucursal = async (id: number): Promise<void> => {
  await api.delete(`/sucursales/${id}`)
}
