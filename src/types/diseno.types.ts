import type { Color } from './color.types'

export interface Subcategoria {
  id: number
  nombre: string
  categoria_id: number
}

export interface DisenoColor {
  id: number
  diseno_id: number
  color_id: number
  descripcion?: string
  colores?: Color
}

// En diseno.types.ts
export interface Diseno {
  diseno_color: never[]
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  precio: number | string;
  imagen?: string;
  activo: boolean;
  nodo_id: number;
  // Agrega esto:
  nodo?: {
    id: number;
    nombre: string;
  };
}

export interface CreateDisenoDto {
  nombre: string
  imagen?: string
  descripcion?: string
  codigo?: string
  nodo_id: number
}

export interface UpdateDisenoDto {
  nombre?: string
  imagen?: string
  descripcion?: string
  codigo?: string
  precio?: number
}