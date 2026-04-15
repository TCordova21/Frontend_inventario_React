import api from '../lib/axios'
import type { Usuario, CreateUsuarioDto } from '../types/usuario.types'

export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data } = await api.get<Usuario[]>('/usuarios')
  return data
}

export const createUsuario = async (dto: CreateUsuarioDto): Promise<Usuario> => {
  const { data } = await api.post<Usuario>('/usuarios', dto)
  return data
}