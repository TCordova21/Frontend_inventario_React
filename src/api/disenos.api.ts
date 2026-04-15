import api from '../lib/axios'
import type { Diseno, CreateDisenoDto, UpdateDisenoDto } from '../types/diseno.types'
import type { Subcategoria } from '../types/categoria.types'

export const getDisenos = async (): Promise<Diseno[]> => {
  const { data } = await api.get<Diseno[]>('/disenos')
  return data
}

export const getDisenoById = async (id: number): Promise<Diseno> => {
  const { data } = await api.get<Diseno>(`/disenos/${id}`)
  return data
}

export const getDisenosBySubcategoria = async (id: number): Promise<Diseno[]> => {
  const { data } = await api.get<Diseno[]>(`/disenos/subcategoria/${id}`)
  return data
}

export const createDiseno = async (dto: CreateDisenoDto): Promise<Diseno> => {
  const { data } = await api.post<Diseno>('/disenos', dto)
  return data
}

export const updateDiseno = async (id: number, dto: UpdateDisenoDto): Promise<Diseno> => {
  const { data } = await api.patch<Diseno>(`/disenos/${id}`, dto)
  return data
}

export const deleteDiseno = async (id: number): Promise<void> => {
  await api.delete(`/disenos/${id}`)
}

export const getSubcategorias = async (): Promise<Subcategoria[]> => {
  const { data } = await api.get<Subcategoria[]>('/subcategorias')
  return data
}