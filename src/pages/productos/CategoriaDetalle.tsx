import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, FolderOpen } from 'lucide-react'
import { getSubcategoriasByCategoria, createSubcategoria } from '../../api/subcategorias.api'
import { getCategorias } from '../../api/categorias.api'
import { getProductos } from '../../api/producto.api'
import type { Subcategoria } from '../../types/categoria.types'
import LoadingScreen from '../../components/LoadingScreen'

const CategoriaDetalle = () => {
  const { productoId, categoriaId } = useParams()
  const navigate = useNavigate()
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [nombreProducto, setNombreProducto] = useState('')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [subs, prods, cats] = await Promise.all([
          getSubcategoriasByCategoria(Number(categoriaId)),
          getProductos(),
          getCategorias(),
        ])
        setSubcategorias(Array.isArray(subs) ? subs : [])
        setNombreProducto(prods.find((p) => p.id === Number(productoId))?.nombre || '')
        setNombreCategoria(cats.find((c) => c.id === Number(categoriaId))?.nombre || '')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [categoriaId, productoId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNombre.trim()) return
    try {
      setSaving(true)
      await createSubcategoria({ nombre: newNombre, categoria_id: Number(categoriaId) })
      const data = await getSubcategoriasByCategoria(Number(categoriaId))
      setSubcategorias(data)
      setNewNombre('')
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

return (
  <div className="p-4 md:p-6">
    {/* Breadcrumb - Adaptable con scroll horizontal en móviles */}
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <button onClick={() => navigate('/productos')} className="hover:text-blue-500 transition-colors">
        Productos
      </button>
      <ChevronRight size={14} className="shrink-0" />
      <button onClick={() => navigate(`/productos/${productoId}`)} className="hover:text-blue-500 transition-colors">
        {nombreProducto}
      </button>
      <ChevronRight size={14} className="shrink-0" />
      <span className="text-gray-700 font-medium">{nombreCategoria}</span>
    </div>

    {/* Header - Responsivo */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{nombreCategoria}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Selecciona una subcategoría</p>
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-sm"
      >
        <Plus size={16} />
        Nueva subcategoría
      </button>
    </div>

    {/* Cards subcategorías - Grid adaptable */}
    {subcategorias.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-48 gap-2 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
        <FolderOpen size={32} className="text-gray-200" />
        <p className="text-gray-400 text-sm">No hay subcategorías para esta categoría</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {subcategorias.map((sub) => (
          <button
            key={sub.id}
            onClick={() => navigate(`/productos/${productoId}/${categoriaId}/${sub.id}`)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group overflow-hidden"
          >
            {/* Folder Header */}
            <div className="h-24 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <FolderOpen size={36} className="text-amber-300 group-hover:text-amber-400 transition-transform group-hover:scale-110 duration-200" />
            </div>
            {/* Folder Info */}
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 truncate">{sub.nombre}</p>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
            </div>
          </button>
        ))}
      </div>
    )}

    {/* Modal inline nueva subcategoría */}
    {modalOpen && (
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setModalOpen(false)}
      >
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Nueva subcategoría</h2>
            <p className="text-xs text-gray-400 mb-4">Añade una nueva agrupación para {nombreCategoria}</p>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 ml-1">Nombre</label>
                <input
                  autoFocus
                  type="text"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  placeholder="Ej: Dragon Ball"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !newNombre.trim()}
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm shadow-blue-200"
                >
                  {saving ? 'Guardando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}
  </div>
)
}

export default CategoriaDetalle