import { useState, useEffect } from 'react'
import { Search, Plus, Users, UserCheck, UserMinus, ShieldCheck } from 'lucide-react'
import { getUsuarios } from '../api/usuarios.api'
import type { Usuario } from '../types/usuario.types'
import CreateUsuarioModal from '../components/modals/CreateUsuarioModal'
import LoadingScreen from '../components/LoadingScreen'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getUsuarios()
      setUsuarios(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Filtro por búsqueda
  const filtrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  // Métricas siguiendo el estándar
  const totalUsuarios = usuarios.length
  const activos = usuarios.filter(u => u.activo).length
  const inactivos = usuarios.filter(u => !u.activo).length
  const administradores = usuarios.filter(u => u.roles?.nombre?.toLowerCase().includes('admin')).length

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            Usuarios
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de usuarios del sistema</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {/* Métricas: 2 columnas en móvil, 4 en desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total usuarios</p>
          <p className="text-2xl font-semibold text-gray-800">{totalUsuarios}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <UserCheck size={12} className="text-green-500" />
            <p className="text-xs text-gray-400">Activos</p>
          </div>
          <p className="text-2xl font-semibold text-green-600">{activos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <UserMinus size={12} className="text-red-400" />
            <p className="text-xs text-gray-400">Inactivos</p>
          </div>
          <p className="text-2xl font-semibold text-red-500">{inactivos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldCheck size={12} className="text-blue-500" />
            <p className="text-xs text-gray-400">Administradores</p>
          </div>
          <p className="text-2xl font-semibold text-blue-600">{administradores}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Tabla con scroll horizontal controlado */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  {/* Usuario */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center border border-gray-200">
                        <span className="text-xs font-bold text-gray-400">
                          {u.nombre.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800">{u.nombre}</p>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-500">{u.email}</span>
                  </td>

                  {/* Rol */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {u.roles ? (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {u.roles.nombre}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {u.activo ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                        Inactivo
                      </span>
                    )}
                  </td>

                  {/* Acción Exacta al Estándar */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => {/* Lógica de gestión */}}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
                    >
                      <Plus size={12} />
                      Actualizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateUsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          fetchData()
        }}
      />
    </div>
  )
}

export default Usuarios