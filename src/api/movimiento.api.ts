import api from '../lib/axios'
import type { Movimiento, CreateMovimientoDto } from '../types/movimiento.types'

/**
 * Obtiene el historial completo de movimientos.
 */
export const getMovimientos = async (): Promise<Movimiento[]> => {
  const { data } = await api.get<Movimiento[]>('/movimientos')
  return data
}

/**
 * Crea un nuevo movimiento (Traslado, Entrada, Ajuste, etc.)
 * Recuerda que los Traslados se crean en estado 'PENDIENTE' por defecto.
 */
export const createMovimiento = async (dto: CreateMovimientoDto): Promise<Movimiento> => {
  const { data } = await api.post<Movimiento>('/movimientos', dto)
  return data
}

/**
 * Confirma la recepción de un traslado pendiente.
 * Este método es el que finalmente impacta el stock en la sucursal de destino.
 * @param id ID del movimiento a confirmar
 */
export const confirmarMovimiento = async (
  id: number, 
  datos: { cantidad_confirmada: number; fecha_confirmacion: string, usuario_confirmacion_id:number }
): Promise<Movimiento> => {
  // Ahora enviamos 'datos' al backend
  const { data } = await api.patch<Movimiento>(`/movimientos/${id}/confirmar`, datos);
  return data;
};

/**
 * Obtiene los movimientos pendientes de recibir para una sucursal específica.
 * Útil para notificaciones o una bandeja de entrada de mercadería.
 */
export const getMovimientosPendientes = async (sucursalId?: number): Promise<Movimiento[]> => {
  const url = sucursalId !== undefined
    ? `/movimientos/pendientes/${sucursalId}`
    : `/movimientos/pendientes`  // ← admin: todos
  const { data } = await api.get<Movimiento[]>(url)
  return data
}
