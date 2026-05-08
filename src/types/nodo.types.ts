export interface Nodo {
  children: never[];
  id: number;
  nombre: string;
  tipo: 'producto' | 'contenedor';
  imagen?: string;
  padre_id?: number | null;
  stock?: number;
  activo: boolean;
  creado_en?: string | Date;
  // Estos vienen del include: { _count: ... } de Prisma
  _count?: {
    other_nodos: number;
    disenos: number;
  };
  // Si en el futuro incluyes las relaciones reales
  other_nodos?: Nodo[]; 
  disenos?: any[]; // Puedes cambiar 'any' por tu interfaz de Diseno cuando la tengas
  total_disenos?: number; // Campo calculado para el total de diseños (incluyendo subnodos)
}

/**
 * DTO para la creación de un Nodo
 */
export interface CreateNodoDto {
  nombre: string;
  tipo: 'producto' | 'contenedor';
  imagen?: string;
  padre_id?: number | null;
  activo?: boolean;
}

/**
 * DTO para la actualización parcial de un Nodo
 * (Usa Partial para que todos los campos sean opcionales)
 */
export interface UpdateNodoDto extends Partial<CreateNodoDto> {}


export interface Ancestro {
  id: number
  nombre: string
  tipo: string
  padre_id: number | null
}