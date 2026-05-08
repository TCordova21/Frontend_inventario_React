import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Users, Pencil, Trash2, Phone, User as UserIcon, HeartHandshake, X,  ChevronRight } from 'lucide-react'
import { getClientes, deleteCliente } from '../api/cliente.api' // Asegúrate de tener deleteCliente
import type { Cliente } from '../types/cliente.types'
import CreateClienteModal from '../components/modals/CreateClienteModal'
import LoadingScreen from '../components/LoadingScreen'
import ConfirmAlert from '../components/ConfirmAlert'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const navigate = useNavigate()

  // Estado para la alerta de confirmación
  const [alertConfig, setAlertConfig] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null
  })

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

  const filtrados = useMemo(() => {
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.contacto.includes(search)
    )
  }, [clientes, search])

  // Métricas
  const total = clientes.length
  const activos = clientes.filter((c) => c.activo).length
  const inactivos = clientes.filter((c) => !c.activo).length

  const handleEdit = (e: React.MouseEvent, cliente: Cliente) => {
    e.stopPropagation() // Evita navegar al detalle
    setSelectedCliente(cliente)
    setModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation() // Evita navegar al detalle
    setAlertConfig({ open: true, id })
  }

  const confirmDelete = async () => {
    if (!alertConfig.id) return
    try {
      await deleteCliente(alertConfig.id)
      setClientes(prev => prev.filter(c => c.id !== alertConfig.id))
      toast.success('Cliente eliminado correctamente')
    } catch (error) {
      toast.error('Error al eliminar el cliente')
    } finally {
      setAlertConfig({ open: false, id: null })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            Clientes
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de cartera de clientes</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 shrink-0"
        >
          <Plus size={18} />
          Nuevo cliente
        </button>
      </div>

      {/* Métricas con diseño de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users size={20} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Clientes</p>
            <p className="text-xl font-black text-gray-800">{total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600"><Users size={20} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Activos</p>
            <p className="text-xl font-black text-green-600">{activos}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg text-red-600"><Users size={20} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Inactivos</p>
            <p className="text-xl font-black text-red-600">{inactivos}</p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-8 max-w-md flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o contacto..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm"
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Grid de Clientes */}
      {filtrados.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center h-64 gap-3 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
          <Users size={40} className="text-gray-200" />
          <p className="text-gray-400 text-sm font-medium italic">No se encontraron clientes registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clientes/${c.id}`)}
              className="group relative bg-white rounded-2xl border border-gray-200 p-4 transition-all hover:shadow-md hover:border-blue-400 cursor-pointer overflow-hidden"
            >
              {/* Acciones flotantes (estilo Colores) */}
              <div className="absolute top-2 right-2 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <button 
                  onClick={(e) => handleEdit(e, c)}
                  className="p-2 bg-white rounded-full text-gray-600 hover:text-blue-600 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <Pencil size={14} />
                </button>
                <button 
                  onClick={(e) => handleDeleteClick(e, c.id)}
                  className="p-2 bg-white rounded-full text-gray-600 hover:text-red-600 shadow-sm border border-gray-100 hover:scale-110 active:scale-95 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Contenido de la Card */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                  <UserIcon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-800 truncate pr-12">{c.nombre}</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${c.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Phone size={13} className="text-gray-400" />
                  <span>{c.contacto || 'Sin contacto'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <HeartHandshake size={13} className="text-gray-400" />
                  <span className="capitalize">{c.tipo}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-tight">Detalles</span>
                <span className="text-blue-500 text-[10px] font-black group-hover:translate-x-1 transition-transform"><ChevronRight size={12} strokeWidth={3}/></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales y Alertas */}
      <CreateClienteModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedCliente(null) }}
        onSuccess={() => { fetchData(); setModalOpen(false); setSelectedCliente(null) }}
        clienteToEdit={selectedCliente}
      />

      <ConfirmAlert
        isOpen={alertConfig.open}
        title="¿Eliminar cliente?"
        message="Se eliminará el cliente de forma permanente. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setAlertConfig({ open: false, id: null })}
        confirmText="Eliminar"
      />
    </div>
  )
}

export default Clientes