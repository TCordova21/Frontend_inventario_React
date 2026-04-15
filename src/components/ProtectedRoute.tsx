import { Outlet } from 'react-router-dom'

const ProtectedRoute = () => {
  console.log('ProtectedRoute ejecutado')
  return <Outlet />
}