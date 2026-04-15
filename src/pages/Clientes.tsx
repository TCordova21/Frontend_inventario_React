import { useState, useEffect } from 'react'
import { Search, Plus, Users } from 'lucide-react'
import { getClientes } from '../api/cliente.api'
import type { Cliente } from '../types/cliente.types'
import CreateClienteModal from '../components/modals/CreateClienteModal'
import LoadingScreen from '../components/LoadingScreen'
import { useNavigate } from 'react-router-dom'

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getClientes()
      setClientes(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.contacto.includes(search)
  )

  // 🔥 MÉTRICAS (igual que inventario)
  const total = clientes.length
  const activos = clientes.filter((c) => c.activo).length
  const inactivos = clientes.filter((c) => !c.activo).length

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" size={24} />
            Clientes
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestión de clientes
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nuevo cliente
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total clientes</p>
          <p className="text-2xl font-semibold text-gray-800">{total}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Activos</p>
          <p className="text-2xl font-semibold text-green-600">{activos}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Inactivos</p>
          <p className="text-2xl font-semibold text-red-500">{inactivos}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

     {/* Lista de clientes */}
{filtrados.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
    <p className="text-gray-400 text-sm">No se encontraron clientes</p>
    <button
      onClick={() => setModalOpen(true)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
    >
      <Plus size={16} />
      Crear primer cliente
    </button>
  </div>
) : (
  <div className="flex flex-col gap-4">
    {filtrados.map((c) => (
      <div
        key={c.id}
        onClick={() => navigate(`/clientes/${c.id}`)}
        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden cursor-pointer"
      >
        <div className="flex items-center gap-4 p-4">

          {/* Avatar */}
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
            <Users size={18} className="text-blue-500" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {c.nombre}
              </p>

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                c.activo
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                {c.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <p className="text-xs text-gray-500">{c.contacto}</p>
          </div>

          {/* Tipo */}
          <div className="flex flex-col items-end gap-1 shrink-0 ml-auto">
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
              {c.tipo}
            </span>
          </div>

        </div>
      </div>
    ))}
  </div>
)}

      <CreateClienteModal
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

export default Clientes