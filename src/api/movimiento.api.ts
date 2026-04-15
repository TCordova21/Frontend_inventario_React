import api from '../lib/axios'
import type { Movimiento, CreateMovimientoDto } from '../types/movimiento.types'

export const getMovimientos = async (): Promise<Movimiento[]> => {
  const { data } = await api.get<Movimiento[]>('/movimientos')
  return data
}

export const createMovimiento = async (dto: CreateMovimientoDto): Promise<Movimiento> => {
  const { data } = await api.post<Movimiento>('/movimientos', dto)
  return data
}