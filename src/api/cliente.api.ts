import api from '../lib/axios'
import type { Cliente, CreateClienteDto, ClienteDiseno } from '../types/cliente.types'

// 🔹 GET ALL
export const getClientes = async (): Promise<Cliente[]> => {
  const { data } = await api.get<Cliente[]>('/clientes')
  return data
}

// 🔹 GET ONE
export const getClienteById = async (id: number): Promise<Cliente> => {
  const { data } = await api.get<Cliente>(`/clientes/${id}`)
  return data
}

// 🔹 CREATE
export const createCliente = async (dto: CreateClienteDto): Promise<Cliente> => {
  const { data } = await api.post<Cliente>('/clientes', dto)
  return data
}

// 🔹 UPDATE
export const updateCliente = async (
  id: number,
  dto: Partial<CreateClienteDto>
): Promise<Cliente> => {
  const { data } = await api.patch<Cliente>(`/clientes/${id}`, dto)
  return data
}

// 🔹 DELETE
export const deleteCliente = async (id: number): Promise<void> => {
  await api.delete(`/clientes/${id}`)
}

// 🔹 GET DISEÑOS DEL CLIENTE
export const getDisenosByCliente = async (clienteId: number): Promise<ClienteDiseno[]> => {
  const { data } = await api.get<ClienteDiseno[]>(`/clientes/${clienteId}/disenos`)
  return data
}

// 🔹 ASIGNAR DISEÑO
export const assignDisenoToCliente = async (dto: {
  diseno_id: number
  cliente_id: number
  exclusivo: boolean
}): Promise<ClienteDiseno> => {
  const { data } = await api.post<ClienteDiseno>('/clientes/assign-diseno', dto)
  return data
}