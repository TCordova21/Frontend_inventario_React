export interface Sucursal {
  id: number
  nombre: string
  tipo: string
  direccion?: string
  activo: boolean
}

export interface CreateSucursalDto {
  nombre: string
  tipo: string
  direccion?: string
  activo: boolean
}