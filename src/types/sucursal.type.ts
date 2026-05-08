// src/types/sucursal.types.ts

export interface Sucursal {
  id: number;
  nombre: string;
  tipo: string;
  direccion?: string;
  activo: boolean;
  usuario_id?: number; // El ID de la FK
  // La relación 'usuarios' que viene del include de Prisma
  usuarios?: {
    id: number;
    nombre: string;
    email?: string;
  };
}

export interface CreateSucursalDto {
  nombre: string;
  tipo: string;
  direccion?: string;
  activo?: boolean; // Lo ponemos opcional porque el backend tiene un @default(true)
  usuario_id?: number; // Para asignar el responsable mediante connect
}

// Es buena práctica tener un UpdateDto que sea parcial
export interface UpdateSucursalDto extends Partial<CreateSucursalDto> {
  id?: number;
}