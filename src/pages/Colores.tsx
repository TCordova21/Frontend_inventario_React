import { useState, useEffect } from 'react'
import { Plus, Copy, Check, Search, Palette, Pencil, Trash2 } from 'lucide-react'
import { getColores, searchColores, deleteColor } from '../api/colores.api'
import type { Color } from '../types/color.types'
import CreateColorModal from '../components/modals/CreateColorModal'
import LoadingScreen from '../components/LoadingScreen'

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

  const isLight = () => {
    const hex = color.codigo_hex.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    return (r * 299 + g * 587 + b * 114) / 1000 > 128
  }

  const badgeStyles = isLight() 
    ? 'bg-black/10 text-gray-800' 
    : 'bg-white/20 text-white'

  const actionIconStyles = isLight()
    ? 'text-gray-800 hover:bg-black/10'
    : 'text-white hover:bg-white/20'

  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col">
      {/* Muestra de Color con Acciones */}
      <div
        className="h-24 w-full relative flex items-center justify-center p-2 transition-all duration-300"
        style={{ backgroundColor: color.codigo_hex }}
      >
        <span className={`absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase backdrop-blur-sm ${badgeStyles}`}>
          {color.activo ? 'Activo' : 'Inactivo'}
        </span>

        {/* Capa de Acciones en Hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 absolute inset-0 bg-black/5 backdrop-blur-[2px] flex items-center justify-center gap-3">
          <button
            onClick={() => onEdit(color)}
            className={`p-2 rounded-full transition-transform hover:scale-110 shadow-sm ${actionIconStyles} hover:!text-blue-500`}
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(color.id)}
            className={`p-2 rounded-full transition-transform hover:scale-110 shadow-sm ${actionIconStyles} hover:!text-red-500`}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Info y Acciones */}
      <div className="p-3 space-y-2">
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-800 truncate" title={color.nombre}>
            {color.nombre}
          </p>
          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-tight">
            {color.codigo_hex}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all text-[10px] font-medium border ${
            copied 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100'
          }`}
        >
          {copied ? (
            <Check size={12} className="animate-in zoom-in duration-200" />
          ) : (
            <Copy size={12} />
          )}
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

  const fetchColores = async () => {
    try {
      setLoading(true)
      const data = await getColores()
      setColores(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchColores()
  }, [])

  // Búsqueda con Debounce
  useEffect(() => {
    if (!search.trim()) {
      fetchColores()
      return
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchColores(search)
        setColores(Array.isArray(data) ? data : [])
      } catch (error) {
        setColores([])
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  const handleEdit = (color: Color) => {
    setSelectedColor(color)
    setModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar este color?')) {
      try {
        await deleteColor(id)
        setColores(prev => prev.filter(c => c.id !== id))
      } catch (error) {
        console.error("Error al eliminar color:", error)
      }
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedColor(null)
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Palette className="text-blue-600" size={24} />
            Colores
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {colores.length} colores en el catálogo
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
        >
          <Plus size={18} />
          Nuevo color
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código hex..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white shadow-sm"
        />
      </div>

      {/* Grid de Contenido */}
      {colores.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
          <Palette size={40} className="text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm italic">
            {search ? 'No se encontraron coincidencias' : 'No hay colores registrados'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {colores.map((color) => (
            <ColorCard 
              key={color.id} 
              color={color} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de Creación / Edición */}
      <CreateColorModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchColores}
        colorToEdit={selectedColor}
      />
    </div>
  )
}

export default Colores