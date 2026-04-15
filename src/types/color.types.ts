export interface Color {
  id: number
  nombre: string
  codigo_hex: string
  activo: boolean
}

export interface CreateColorDto {
  nombre: string
  codigo_hex: string
}