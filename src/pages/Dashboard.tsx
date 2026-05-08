import AdminDashboard from '../components/dashboard/AdminDashboard'
import VendedorDashboard from '../components/dashboard/VendedorDashboard'

import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { usuario } = useAuth()

  if (!usuario) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-xl font-semibold text-red-600">
          Usuario no autenticado
        </h1>
      </div>
    )
  }

  if (usuario.rol === 'ADMIN') {
    return <AdminDashboard />
  }

  if (usuario.rol === 'VENDEDOR') {
    return <VendedorDashboard />
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-xl font-semibold text-gray-700">
        Rol no soportado
      </h1>

      <p className="text-sm text-gray-400 mt-2">
        Rol actual: {usuario.rol}
      </p>
    </div>
  )
}

export default Dashboard