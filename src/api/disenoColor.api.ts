import api from '../lib/axios'
import type { DisenoColor } from '../types/diseno.types'

export interface CreateDisenoColorDto {
  diseno_id: number
  color_id: number
  descripcion?: string
}

export const getDisenoColorsByDiseno = async (disenoId: number): Promise<DisenoColor[]> => {
  const { data } = await api.get<DisenoColor[]>(`/diseno-color/diseno/${disenoId}`)
  return data
}

export const createDisenoColor = async (dto: CreateDisenoColorDto): Promise<DisenoColor> => {
  const { data } = await api.post<DisenoColor>('/diseno-color', dto)
  return data
}

export const deleteDisenoColor = async (id: number): Promise<void> => {
  await api.delete(`/diseno-color/${id}`)
}