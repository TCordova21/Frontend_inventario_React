import api from '../lib/axios'
import type { Color, CreateColorDto } from '../types/color.types'

export const getColores = async (): Promise<Color[]> => {
  const { data } = await api.get<Color[]>('/colores')
  return data
}

export const searchColores = async (q: string): Promise<Color[]> => {
  const { data } = await api.get<Color[]>(`/colores/search?q=${q}`)
  return data
}

export const createColor = async (dto: CreateColorDto): Promise<Color> => {
  const { data } = await api.post<Color>('/colores', dto)
  return data
}
export const deleteColor = async (id: number): Promise<void> => { 
  await api.delete(`/colores/${id}`)
}

export const updateColor = async (id: number, dto: CreateColorDto): Promise<Color> => {
  const { data } = await api.patch<Color>(`/colores/${id}`, dto)
  return data
}