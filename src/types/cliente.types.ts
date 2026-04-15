import type { Diseno } from './diseno.types'

export interface Cliente {
  id: number
  nombre: string
  contacto: string
  tipo: string
  activo: boolean
}
export interface ClienteDiseno {
  id: number
  diseno_id: number
  cliente_id: number
  exclusivo: boolean
  disenos: Diseno | null
}

export interface ClienteDetalle extends Cliente {
  diseno_cliente: ClienteDiseno[]
}

export interface CreateClienteDto {
  nombre: string
  contacto: string
  tipo: string
}

export interface UpdateClienteDto {
  nombre?: string
  contacto?: string
  tipo?: string
  activo?: boolean
}

export interface AssignDisenoClienteDto {
  diseno_id: number
  cliente_id: number
  exclusivo: boolean
}