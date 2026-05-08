export interface CreateVentaDto {
  usuario_id?: number | null;
  sucursal_id: number;
  detalles: {
    nodo_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

// Define los estados posibles para todo el sistema
export type EstadoVenta = 'COMPLETADA' | 'CANCELADA' | 'DEVUELTA';

export interface Venta {
  id: number;
  fecha: string;
  total: number;
  sucursal_id: number | null;
  usuario_id: number;
  estado: EstadoVenta; // Usamos el tipo centralizado aquí
}

// Este tipo incluye las relaciones que configuramos en el backend (findAll/findOne)


export interface VentaDetalle extends Venta {
  sucursales?: {
    nombre: string;
    tipo: string;
  };
  usuarios?: {
    nombre: string;
  };
  detalle_ventas: {
    id: number;
    cantidad: number;
    precio_unitario: number;
    diseno_id: number | null;
    nodo_id: number;
    disenos?: {
      nombre: string;
      codigo: string;
      imagen?: string;
    };
    nodos?: {
      nombre: string;
    };
  }[];
}


