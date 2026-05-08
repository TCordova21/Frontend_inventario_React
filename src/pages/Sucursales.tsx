import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Store, Pencil, Trash2, User, Layers, ShieldCheck } from 'lucide-react'
import { getSucursales, deleteSucursal } from '../api/sucursal.api'
import type { Sucursal } from '../types/sucursal.type'
import CreateSucursalModal from '../components/modals/CreateSucursalModal'
import LoadingScreen from '../components/LoadingScreen'
import ConfirmAlert from '../components/ConfirmAlert'
import WarningAlert from '../components/WarningAlert' // Importación añadida
import { toast } from 'react-toastify'

// --- Subcomponente: SucursalCard (Sin cambios) ---
interface SucursalCardProps {
  sucursal: Sucursal;
  onEdit: (sucursal: Sucursal) => void;
  onDelete: (id: number) => void;
}

const SucursalCard = ({ sucursal, onEdit, onDelete }: SucursalCardProps) => {
  const esMatriz = sucursal.tipo === 'MATRIZ';

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
      <div className={`h-28 w-full relative flex items-center justify-center p-2 border-b border-gray-100 ${esMatriz ? 'bg-blue-50/30' : 'bg-slate-50'}`}>
        {esMatriz ? (
          <Layers className="text-blue-500" size={40} />
        ) : (
          <Store className="text-green-500" size={40} />
        )}
        
        <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase backdrop-blur-sm ${
          sucursal.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {sucursal.activo ? 'Operativa' : 'Inactiva'}
        </span>

        <span className={`absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
          esMatriz ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
        }`}>
          {sucursal.tipo}
        </span>
        
        <div className="md:opacity-0 group-hover:opacity-100 transition-all duration-300 absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center gap-3">
          <button onClick={() => onEdit(sucursal)} className="md:p-2 p-4 rounded-full bg-white text-gray-700 shadow-sm border border-gray-100 hover:text-blue-500 hover:scale-110 transition-all">
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(sucursal.id)} className="md:p-2 p-4 rounded-full bg-white text-gray-700 shadow-sm border border-gray-100 hover:text-red-500 hover:scale-110 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div>
          <h3 className="text-xs font-bold text-gray-800 truncate uppercase tracking-tight">{sucursal.nombre}</h3>
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{sucursal.direccion || 'Sin dirección'}</p>
        </div>

        <div className="pt-2 border-t border-gray-50 flex items-center gap-2">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center ${esMatriz ? 'bg-indigo-50' : 'bg-blue-50'}`}>
            {esMatriz ? (
              <ShieldCheck size={12} className="text-indigo-500" />
            ) : (
              <User size={12} className="text-blue-500" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] text-gray-400 leading-none">
              {esMatriz ? 'Gestión' : 'Responsable'}
            </p>
            <p className="text-[10px] font-medium text-gray-700 truncate mt-0.5">
              {esMatriz ? 'Administración Central' : (sucursal.usuarios?.nombre || 'No asignado')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Componente Principal ---
const Sucursales = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null)
  
  // Estados para alertas
  const [alertConfig, setAlertConfig] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [warningConfig, setWarningConfig] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

  const fetchSucursales = async () => {
    try {
      setLoading(true)
      const data = await getSucursales()
      setSucursales(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSucursales() }, [])

  const filtrados = useMemo(() => {
    return sucursales.filter(s => 
      s.nombre.toLowerCase().includes(search.toLowerCase()) ||
      s.usuarios?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      s.tipo.toLowerCase().includes(search.toLowerCase())
    )
  }, [sucursales, search])

  const confirmDelete = async () => {
    if (!alertConfig.id) return
    try {
      await deleteSucursal(alertConfig.id)
      setSucursales(prev => prev.filter(s => s.id !== alertConfig.id))
      toast.success('Sucursal desactivada correctamente')
      setAlertConfig({ open: false, id: null })
    } catch (error: any) {
      // Capturamos el error 400 del backend y mostramos WarningAlert
      const errorMessage = error.response?.data?.message || 'No se puede desactivar la sucursal'
      setAlertConfig({ open: false, id: null })
      setWarningConfig({ open: true, message: errorMessage })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
           
            Sucursales
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtrados.length} locales registrados</p>
        </div>
        <button onClick={() => { setSelectedSucursal(null); setModalOpen(true); }} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
          <Plus size={18} />
          Nueva Sucursal
        </button>
      </div>

      <div className="relative mb-8 max-w-md flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, tipo o responsable..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtrados.map(s => (
          <SucursalCard 
            key={s.id} 
            sucursal={s} 
            onEdit={(suc) => { setSelectedSucursal(suc); setModalOpen(true) }} 
            onDelete={(id) => setAlertConfig({ open: true, id })} 
          />
        ))}
      </div>

      <CreateSucursalModal 
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedSucursal(null) } }
        onSuccess={fetchSucursales}
        sucursalToEdit={selectedSucursal} sucursalesExistentes={[]}      />

      <ConfirmAlert 
        isOpen={alertConfig.open}
        title="¿Desactivar sucursal?"
        message="La sucursal ya no aparecerá en los listados operativos."
        onConfirm={confirmDelete}
        onCancel={() => setAlertConfig({ open: false, id: null })}
      />

      <WarningAlert 
        isOpen={warningConfig.open}
        title="Acción Denegada"
        message={warningConfig.message}
        onClose={() => setWarningConfig({ open: false, message: '' })}
      />
    </div>
  )
}

export default Sucursales