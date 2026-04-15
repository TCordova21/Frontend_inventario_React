import api from '../lib/axios'
import type { Venta, VentaDetalle, CreateVentaDto } from '../types/venta.types'

export const getVentas = async (): Promise<VentaDetalle[]> => {
  const { data } = await api.get<VentaDetalle[]>('/ventas')
  return data
}

export const getVentaById = async (id: number): Promise<VentaDetalle> => {
  const { data } = await api.get<VentaDetalle>(`/ventas/${id}`)
  return data
}

export const createVenta = async (dto: CreateVentaDto): Promise<Venta> => {
  const { data } = await api.post<Venta>('/ventas', dto)
  return data
}