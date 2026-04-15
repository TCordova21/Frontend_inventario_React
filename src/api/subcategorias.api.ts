import api from '../lib/axios'
import type { Subcategoria, CreateSubcategoriaDto } from '../types/categoria.types'

export const getSubcategorias = async (): Promise<Subcategoria[]> => {
  const { data } = await api.get<Subcategoria[]>('/subcategorias')
  return data
}

export const getSubcategoriasByCategoria = async (categoriaId: number): Promise<Subcategoria[]> => {
  const { data } = await api.get<Subcategoria[]>(`/subcategorias/categoria/${categoriaId}`)
  return data
}

export const createSubcategoria = async (dto: CreateSubcategoriaDto): Promise<Subcategoria> => {
  const { data } = await api.post<Subcategoria>('/subcategorias', dto)
  return data
}