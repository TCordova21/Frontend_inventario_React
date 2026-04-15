export interface Categoria {
  id: number
  nombre: string
  producto_id: number
}

export interface CreateCategoriaDto {
  nombre: string
  producto_id: number  // ← nuevo campo obligatorio
}

export interface Subcategoria {
  id: number
  nombre: string
  categoria_id: number
  categorias?: Categoria
}

export interface CreateSubcategoriaDto {
  nombre: string
  categoria_id: number
}