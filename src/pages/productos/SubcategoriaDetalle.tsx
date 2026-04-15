import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, ImageOff } from 'lucide-react'
import { getDisenosBySubcategoria } from '../../api/disenos.api'
import { getSubcategorias } from '../../api/subcategorias.api'
import { getCategorias } from '../../api/categorias.api'
import { getProductos } from '../../api/producto.api'
import type { Diseno } from '../../types/diseno.types'
import CreateDisenoModal from '../../components/modals/CreateDisenoModal'
import LoadingScreen from '../../components/LoadingScreen'

const SubcategoriaDetalle = () => {
  const { productoId, categoriaId, subcategoriaId } = useParams()
  const navigate = useNavigate()

  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [nombreProducto, setNombreProducto] = useState('')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [nombreSubcategoria, setNombreSubcategoria] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalDisenoOpen, setModalDisenoOpen] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [disList, prods, cats, subs] = await Promise.all([
        getDisenosBySubcategoria(Number(subcategoriaId)),
        getProductos(),
        getCategorias(),
        getSubcategorias(),
      ])
      setDisenos(Array.isArray(disList) ? disList : [])
      setNombreProducto(prods.find((p) => p.id === Number(productoId))?.nombre || '')
      setNombreCategoria(cats.find((c) => c.id === Number(categoriaId))?.nombre || '')
      setNombreSubcategoria(subs.find((s) => s.id === Number(subcategoriaId))?.nombre || '')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [subcategoriaId])

  const handleDisenoCreado = () => {
    setModalDisenoOpen(false)
    fetchData()
  }

  if (loading) return <LoadingScreen />

 // ... (mismos imports y lógica de estado anteriores)

return (
  <div className="p-4 md:p-6">
    {/* Breadcrumb - Añadido scroll horizontal para móviles */}
    <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
      <button onClick={() => navigate('/productos')} className="hover:text-blue-500 transition-colors">
        Productos
      </button>
      <ChevronRight size={14} className="shrink-0" />
      <button onClick={() => navigate(`/productos/${productoId}`)} className="hover:text-blue-500 transition-colors">
        {nombreProducto}
      </button>
      <ChevronRight size={14} className="shrink-0" />
      <button onClick={() => navigate(`/productos/${productoId}/${categoriaId}`)} className="hover:text-blue-500 transition-colors">
        {nombreCategoria}
      </button>
      <ChevronRight size={14} className="shrink-0" />
      <span className="text-gray-700 font-medium">{nombreSubcategoria}</span>
    </div>

    {/* Header - Responsivo (se apila en móviles) */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">{nombreSubcategoria}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{disenos.length} diseños en esta subcategoría</p>
      </div>
      <button
        onClick={() => setModalDisenoOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
      >
        <Plus size={16} />
        Nuevo diseño
      </button>
    </div>

    {/* Sin diseños */}
    {disenos.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
        <p className="text-gray-400 text-sm">No hay diseños en esta subcategoría</p>
        <button
          onClick={() => setModalDisenoOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus size={16} />
          Crear primer diseño
        </button>
      </div>
    ) : (
      <div className="flex flex-col gap-4">
        {disenos.map((diseno) => (
          <div
            key={diseno.id}
            onClick={() => navigate(`/productos/${productoId}/${categoriaId}/${subcategoriaId}/${diseno.id}`)}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden cursor-pointer"
          >
            {/* Contenedor principal de la tarjeta: Adaptable */}
            <div className="flex flex-row items-center gap-4 p-4">

              {/* Imagen - Tamaño fijo que no se deforma */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                {diseno.imagen ? (
                  <img
                    src={diseno.imagen}
                    alt={diseno.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageOff size={18} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info - Flex-1 para ocupar el espacio central */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-gray-800 truncate">{diseno.nombre}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    diseno.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {diseno.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-400 mb-1">{diseno.codigo}</p>
                {diseno.descripcion && (
                  <p className="text-xs text-gray-500 truncate hidden sm:block">{diseno.descripcion}</p>
                )}
              </div>

              {/* Precio y subcategoría - Alineación a la derecha */}
              <div className="flex flex-col items-end gap-1.5 shrink-0 ml-auto">
                {diseno.precio ? (
                  <span className="text-sm font-bold text-gray-800">
                    ${parseFloat(String(diseno.precio)).toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 italic">Sin precio</span>
                )}
                {diseno.subcategorias && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                    {diseno.subcategorias.nombre}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Modal crear diseño */}
    <CreateDisenoModal
      isOpen={modalDisenoOpen}
      onClose={() => setModalDisenoOpen(false)}
      onSuccess={handleDisenoCreado}
      subcategoriaId={Number(subcategoriaId)}
    />
  </div>
)
}

export default SubcategoriaDetalle