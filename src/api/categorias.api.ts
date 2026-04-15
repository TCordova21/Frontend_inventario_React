import api from '../lib/axios'
import type { Categoria, CreateCategoriaDto } from '../types/categoria.types'

export const getCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get<Categoria[]>('/categorias')
  return data
}

export const getCategoriasByProducto = async (productoId: number): Promise<Categoria[]> => {
  const { data } = await api.get<Categoria[]>(`/categorias/producto/${productoId}`)
  return data
}

export const createCategoria = async (dto: CreateCategoriaDto): Promise<Categoria> => {
  const { data } = await api.post<Categoria>('/categorias', dto)
  return data
}