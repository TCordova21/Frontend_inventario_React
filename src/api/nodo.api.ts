import api from '../lib/axios'
import type { Nodo, CreateNodoDto, UpdateNodoDto, Ancestro } from '../types/nodo.types'
import type { Diseno, CreateDisenoDto} from '../types/diseno.types'

// --- ENDPOINTS DE NODOS (Categorías/Productos Base) ---

/**
 * Obtiene TODOS los nodos (necesario para reconstruir jerarquías en el front)
 */
export const getNodos = async (): Promise<Nodo[]> => {
  const { data } = await api.get<Nodo[]>('/nodos')
  return data
}

/**
 * Obtiene los nodos raíz (donde padre_id es null)
 */
export const getNodosRaiz = async (): Promise<Nodo[]> => {
  const { data } = await api.get<Nodo[]>('/nodos')
  // Filtramos los que no tienen padre para obtener el nivel superior
  return data.filter(n => n.padre_id === null)
}

/**
 * Obtiene un nodo específico con sus hijos y diseños
 */
export const getNodoById = async (id: number): Promise<Nodo> => {
  const { data } = await api.get<Nodo>(`/nodos/${id}`)
  return data
}

export const createNodo = async (dto: CreateNodoDto): Promise<Nodo> => {
  const { data } = await api.post<Nodo>('/nodos', dto)
  return data
}

export const updateNodo = async (id: number, dto: UpdateNodoDto): Promise<Nodo> => {
  const { data } = await api.patch<Nodo>(`/nodos/${id}`, dto)
  return data
}

export const deleteNodo = async (id: number): Promise<void> => {
  await api.delete(`/nodos/${id}`)
}

// --- ENDPOINTS DE DISEÑOS (Variantes/Estampados) ---

export const createDiseno = async (dto: CreateDisenoDto): Promise<Diseno> => {
  const { data } = await api.post<Diseno>('/disenos', dto)
  return data
}

/**
 * Obtiene todos los diseños de un nodo/contenedor específico
 */
export const getDisenosByNodo = async (nodoId: number): Promise<Diseno[]> => {
  const { data } = await api.get<Diseno[]>(`/disenos/nodo/${nodoId}`)
  return data
}

export const deleteDiseno = async (id: number): Promise<void> => {
  await api.delete(`/disenos/${id}`)
}

export const getDisenosFlaten = async (rootId: number) => {
  const { data } = await api.get(`/nodos/${rootId}/disenos-flaten`);
  return data; // Retorna un array plano: [{id: 31, nombre: 'Gorro franjas', ...}, ...]
};

export const getAncestros = async (id: number): Promise<Ancestro[]> => {
  const { data } = await api.get<Ancestro[]>(`/nodos/${id}/ancestros`)
  return data
}