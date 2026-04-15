export interface Rol {
  id: number
  nombre: string
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  password: string
  activo: boolean
  ultimo_acceso: string | null
  rol_id: number
  roles: Rol
}

export interface CreateUsuarioDto {
  nombre: string
  email: string
  password: string
  rol_id: number
}