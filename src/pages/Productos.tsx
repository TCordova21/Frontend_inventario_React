import { useState, useEffect } from 'react'
import { Plus, Package, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getProductos } from '../api/producto.api'
import type { Producto} from '../types/producto.types'
import CreateProductoModal from '../components/modals/CreateProductoModal'
import LoadingScreen from '../components/LoadingScreen'

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  const fetchProductos = async () => {
    try {
      setLoading(true)
      const data = await getProductos()
      setProductos(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProductos() }, [])

  if (loading) return <LoadingScreen />


return (
  <div className="p-4 md:p-6">
    {/* Header - Responsivo */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">Productos</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {productos.length} {productos.length === 1 ? 'producto registrado' : 'productos registrados'}
        </p>
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
      >
        <Plus size={18} />
        Nuevo producto
      </button>
    </div>

    {/* Cards - Grid Adaptable */}
    {productos.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-64 gap-3 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
        <Package size={48} className="text-gray-200" />
        <p className="text-gray-400 text-sm">No hay productos registrados todavía</p>
        <button
          onClick={() => setModalOpen(true)}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Crear el primero
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {productos.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/productos/${p.id}`)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left group overflow-hidden flex flex-col"
          >
            {/* Ícono con Gradiente Estándar Nivel 1 */}
            <div className="h-28 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border-b border-gray-50">
              <Package 
                size={40} 
                className="text-blue-300 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300" 
              />
            </div>

            {/* Info del Producto */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                  {p.nombre}
                </p>
                {p.descripcion && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                    {p.descripcion}
                  </p>
                )}
              </div>
              <ChevronRight 
                size={18} 
                className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all shrink-0" 
              />
            </div>
          </button>
        ))}
      </div>
    )}

    {/* Modal de Creación */}
    <CreateProductoModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      onSuccess={fetchProductos}
    />
  </div>
)


}

export default Productos