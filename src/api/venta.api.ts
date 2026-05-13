import api from '../lib/axios'
import type { Venta, VentaDetalle, CreateVentaDto } from '../types/venta.types'

// Definimos la interfaz para el cuerpo de la devolución parcial
export interface DevolucionItem {
  detalle_venta_id: number;
  cantidad: number;
}

export interface ProcessDevolucionDto {
  items: DevolucionItem[];
}

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
/**
 * Procesa una devolución parcial o total.
 * @param id ID de la venta
 * @param items Array de objetos con el ID del detalle y la cantidad a devolver
 */
export const procesarDevolucion = async (id: number, items: DevolucionItem[]): Promise<Venta> => {
  const { data } = await api.patch<Venta>(`/ventas/${id}/devolucion`, { items });
  return data;
}

// Mantenemos esta función por compatibilidad, pero ahora usa procesarDevolucion
export const updateEstadoVenta = async (id: number, estado: string, items?: DevolucionItem[]) => {
  if (estado === 'DEVUELTA' || estado === 'PARCIALMENTE_DEVUELTA') {
    if (!items || items.length === 0) {
      throw new Error("Se requieren los items para procesar la devolución");
    }
    return await procesarDevolucion(id, items);
  }
  
  // Si en el futuro tienes otros cambios de estado simples (ej. PENDIENTE -> COMPLETADA)
  const { data } = await api.patch(`/ventas/${id}/estado`, { estado });
  return data;
};