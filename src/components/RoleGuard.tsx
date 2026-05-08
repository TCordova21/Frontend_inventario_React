import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTE_PERMISSIONS } from '../router/permissions'
import type { JSX } from 'react'

interface Props {
  children: JSX.Element
  routeKey: keyof typeof ROUTE_PERMISSIONS
}

const RoleGuard = ({ children, routeKey }: Props) => {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />

  const allowed = ROUTE_PERMISSIONS[routeKey]

  if (!allowed.includes(usuario.rol)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default RoleGuard