import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Layers } from 'lucide-react'
import { getCategoriasByProducto, createCategoria } from '../../api/categorias.api'
import { getProductos } from '../../api/producto.api'
import type { Categoria } from '../../types/categoria.types'
import type { Producto } from '../../types/producto.types'
import LoadingScreen from '../../components/LoadingScreen'

const ProductoDetalle = () => {
  const { productoId } = useParams()
  const navigate = useNavigate()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [prods, cats] = await Promise.all([
          getProductos(),
          getCategoriasByProducto(Number(productoId)),  // ← filtrado por producto
        ])
        const prod = prods.find((p) => p.id === Number(productoId))
        setProducto(prod || null)
        setCategorias(Array.isArray(cats) ? cats : [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [productoId])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNombre.trim()) return
    try {
      setSaving(true)
      setError(null)
      await createCategoria({
        nombre: newNombre,
        producto_id: Number(productoId),  // ← se envía automáticamente
      })
      const data = await getCategoriasByProducto(Number(productoId))
      setCategorias(data)
      setNewNombre('')
      setModalOpen(false)
    } catch {
      setError('Error al crear la categoría')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />


return (
  <div className="p-4 md:p-6">
    {/* Breadcrumb - Adaptable con scroll horizontal */}
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <button onClick={() => navigate('/productos')} className="hover:text-blue-500 transition-colors">
        Productos
      </button>
      <ChevronRight size={14} className="shrink-0" />
      <span className="text-gray-700 font-medium">{producto?.nombre}</span>
    </div>

    {/* Header - Responsivo */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{producto?.nombre}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Selecciona una categoría</p>
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shadow-sm"
      >
        <Plus size={16} />
        Nueva categoría
      </button>
    </div>

    {/* Cards Categorías - Grid Adaptable */}
    {categorias.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-48 gap-3 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-100">
        <p className="text-gray-400 text-sm">No hay categorías para este producto</p>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus size={16} />
          Crear primera categoría
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/productos/${productoId}/${cat.id}`)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group overflow-hidden"
          >
            {/* Header de la Card con gradiente Violeta */}
            <div className="h-24 bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
              <Layers size={36} className="text-violet-300 group-hover:text-violet-400 transition-transform group-hover:scale-110 duration-200" />
            </div>
            {/* Info de la Card */}
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800 truncate">{cat.nombre}</p>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors shrink-0" />
            </div>
          </button>
        ))}
      </div>
    )}

    {/* Modal Nueva Categoría */}
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">Nueva categoría</h2>
            <p className="text-xs text-gray-400 mb-4">Para: {producto?.nombre}</p>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 ml-1">Nombre de la categoría</label>
                <input
                  autoFocus
                  type="text"
                  value={newNombre}
                  onChange={(e) => { setNewNombre(e.target.value); setError(null) }}
                  placeholder="Ej: Anime, Deportes, Marcas..."
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition ${
                    error ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
              
              {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                  {error}
                </div>
              )}
              
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
                  className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm"
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

export default ProductoDetalle