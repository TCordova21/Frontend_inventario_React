export interface Rol {
  id: number
  nombre: string
}

export interface Usuario {
  id: number
  nombre: string
  apellido:string
  email: string
  password: string
  activo: boolean
  ultimo_acceso: string | null
  rol_id: number
  roles: Rol
}

export interface CreateUsuarioDto {
  nombre: string
  apellido:string
  email: string
  password: string
  rol_id: number
}

export interface updatedUsuariosDto {
   nombre: string
  apellido:string
  email: string
  password: string
  rol_id: number
}