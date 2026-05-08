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
  // Asegúrate de que los precios vayan como números si el input los maneja como strings
  const { data } = await api.post<Venta>('/ventas', dto)
  return data
}

// Nueva: Para anular ventas desde la interfaz
export const cancelarVenta = async (id: number): Promise<Venta> => {
  const { data } = await api.delete<Venta>(`/ventas/${id}`)
  return data
}

export const updateEstadoVenta = async (id: number, estado: string) => {
  // Si el estado es 'DEVUELTA', llamamos al endpoint específico
  if (estado === 'DEVUELTA') {
    const response = await api.patch(`/ventas/${id}/devolucion`);
    return response.data;
  }

};