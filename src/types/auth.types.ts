export interface Usuario {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: string
  sucursal_id:number | null
  nombre_sucursal:string | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  usuario: Usuario
}

export interface LoginDto {
  email: string
  password: string
}