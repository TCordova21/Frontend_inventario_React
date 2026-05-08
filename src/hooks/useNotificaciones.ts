import { useState, useEffect, useCallback } from 'react'
import { getMovimientosPendientes } from '../api/movimiento.api'
import type { Movimiento } from '../types/movimiento.types'

export const useNotificaciones = (sucursalId?: number) => {
  const [pendientes, setPendientes] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(false)

const fetchPendientes = useCallback(async () => {
  try {
    setLoading(true)
    console.log('Fetching pendientes — sucursalId:', sucursalId)
    const data = await getMovimientosPendientes(sucursalId)
    console.log('Pendientes response:', data)
    setPendientes(Array.isArray(data) ? data : [])
  } catch (err) {
    console.error('Error pendientes:', err)
    setPendientes([])
  } finally {
    setLoading(false)
  }
}, [sucursalId])

  useEffect(() => {
    fetchPendientes()
    const interval = setInterval(fetchPendientes, 60000)
    return () => clearInterval(interval)
  }, [fetchPendientes])

  return { pendientes, loading, refetch: fetchPendientes }
}