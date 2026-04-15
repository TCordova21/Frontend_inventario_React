import { useEffect, useState } from 'react'
import api from '../lib/axios'
import type { DisenoColor } from '../types/inventario.types'

export const useProducto = () => {
  const [inventario, setInventario] = useState<DisenoColor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/diseno-color')

        console.log('response.data:', response.data)
        console.log('tipo:', typeof response.data)
        console.log('es array:', Array.isArray(response.data))

        // Extraer el array sin importar la forma de la respuesta
        let lista: DisenoColor[] = []

        if (Array.isArray(response.data)) {
          lista = response.data
        } else if (Array.isArray(response.data?.data)) {
          lista = response.data.data
        } else {
          console.warn('Formato inesperado:', response.data)
        }

        setInventario(lista)
      } catch (err) {
        console.error('Error al cargar inventario:', err)
        setError('Error al cargar el inventario')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { inventario, loading, error }
}