import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTE_PERMISSIONS } from '../router/permissions'

const ProtectedRoute = () => {
  const { isAuthenticated, initializing } = useAuth()

  // 🟡 Espera a que el contexto esté listo
  if (initializing) return null

  // 🔴 Solo redirige cuando ya sabemos el estado real
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute