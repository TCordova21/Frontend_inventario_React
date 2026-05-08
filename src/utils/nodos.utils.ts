// src/utils/nodos.utils.ts

export const encontrarNodoRaiz = (nodos: any[], nodoIdActual: number): number => {
  // Buscamos el nodo actual en la lista
  const nodo = nodos.find(n => n.id === nodoIdActual);
  
  // Si no existe el nodo o no tiene padre, este es el nivel raíz
  if (!nodo || !nodo.padre_id) {
    return nodoIdActual;
  }
  
  // Si tiene padre, seguimos subiendo recursivamente
  return encontrarNodoRaiz(nodos, nodo.padre_id);
};