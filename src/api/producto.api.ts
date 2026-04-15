import api from '../lib/axios'
import type { DisenoColor } from '../types/disenoColor.types'
import type { CreateProductoDto, Producto } from '../types/producto.types'

export const getDisenoColor = async (): Promise<DisenoColor[]> => {
  const { data } = await api.get<DisenoColor[]>('/diseno-color')
  return data
}

export const getProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>('/products')
  return data
}

export const createProducto = async (dto: CreateProductoDto): Promise<Producto> => {
  const { data } = await api.post<Producto>('/products', dto)
  return data
}