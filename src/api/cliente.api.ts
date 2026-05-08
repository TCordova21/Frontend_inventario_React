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

// En tu archivo de servicios del frontend:

export const unassignDiseno = async (clienteId: number, disenoId: number) => {
  const { data } = await api.delete(`/clientes/${clienteId}/disenos/${disenoId}`);
  return data;
  
};

// Al asignar, ahora puedes pasar el campo exclusivo si lo deseas
export const assignDiseno = async (clienteId: number, disenoId: number, exclusivo: boolean = false) => {
  const { data } = await api.post(`/clientes/assign-diseno`, {
    cliente_id: clienteId,
    diseno_id: disenoId,
    exclusivo
  });
  return data;
};