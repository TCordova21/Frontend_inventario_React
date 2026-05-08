import { useState, useEffect, useMemo } from 'react'
import { Plus, Copy, Check, Search, Palette, Pencil, Trash2, X } from 'lucide-react'
import { getColores, deleteColor } from '../api/colores.api'
import type { Color } from '../types/color.types'
import CreateColorModal from '../components/modals/CreateColorModal'
import LoadingScreen from '../components/LoadingScreen'
import ConfirmAlert from '../components/ConfirmAlert' // Importación de tu componente
import { toast } from 'react-toastify' // Asumiendo que usas toast como en Productos

// --- Subcomponente: ColorCard ---
interface ColorCardProps {
  color: Color;
  onEdit: (color: Color) => void;
  onDelete: (id: number) => void;
}

const ColorCard = ({ color, onEdit, onDelete }: ColorCardProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(color.codigo_hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }




  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
      <div className="h-24 w-full relative flex items-center justify-center p-2 transition-all duration-300" style={{ backgroundColor: color.codigo_hex }}>
        {/* <span className={`absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-md font-medium uppercase  backdrop-blur-sm ${badgeStyles}`}>
          {color.activo ? 'Activo' : 'Inactivo'}
        </span>*/}
        <div className="md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-start justify-end gap-2 p-2">
          <button onClick={() => onEdit(color)} className={`p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-all hover:scale-110 shadow-lg active:scale-90 `}>
            <Pencil size={16} />
          </button>
          <button onClick={() => onDelete(color.id)} className={`p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-all hover:scale-110 shadow-lg active:scale-90`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate">{color.nombre}</p>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">{color.codigo_hex}</p>
        </div>
        <button onClick={handleCopy} className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all text-[10px] font-medium border ${copied ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100'}`}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copiado' : 'Copiar HEX'}
        </button>
      </div>
    </div>
  )
}

// --- Componente Principal: Colores ---
const Colores = () => {
  const [colores, setColores] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState<Color | null>(null)

  // Estado para la alerta de confirmación
  const [alertConfig, setAlertConfig] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null
  })

  const fetchColores = async () => {
    try {
      setLoading(true)
      const data = await getColores()
      setColores(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchColores() }, [])

  const filtrados = useMemo(() => {
    return colores.filter((c) => 
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.codigo_hex.toLowerCase().includes(search.toLowerCase())
    )
  }, [colores, search])

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setModalOpen(true)
  }

  // Abre la alerta en lugar de window.confirm
  const handleDeleteClick = (id: number) => {
    setAlertConfig({ open: true, id })
  }

  // Proceso real de eliminación
  const confirmDelete = async () => {
    if (!alertConfig.id) return
    try {
      await deleteColor(alertConfig.id)
      setColores(prev => prev.filter(c => c.id !== alertConfig.id))
      toast.success('Color eliminado correctamente')
    } catch (error) {
      toast.error('Error al eliminar el color')
      console.error(error)
    } finally {
      setAlertConfig({ open: false, id: null })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            
            Colores
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtrados.length} {filtrados.length === 1 ? 'color' : 'colores'} encontrados
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto">
          <Plus size={18} />
          Nuevo color
        </button>
      </div>

      <div className="relative mb-8 max-w-md flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código hex..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm"
          />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
          <Palette size={40} className="text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm italic">
            {search ? `No hay resultados para "${search}"` : 'No hay colores registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtrados.map((color) => (
            <ColorCard key={color.id} color={color} onEdit={handleEdit} onDelete={handleDeleteClick} />
          ))}
        </div>
      )}

      {/* Modals y Alertas */}
      <CreateColorModal 
        isOpen={modalOpen} 
        onClose={() => {setModalOpen(false); setSelectedColor(null)}} 
        onSuccess={fetchColores} 
        colorToEdit={selectedColor} 
      />

      <ConfirmAlert 
        isOpen={alertConfig.open}
        title="¿Eliminar color?"
        message="Esta acción quitará el color del catálogo de forma permanente."
        onConfirm={confirmDelete}
        onCancel={() => setAlertConfig({ open: false, id: null })}
        confirmText="Eliminar"
      />
    </div>
  )
}

export default Colores