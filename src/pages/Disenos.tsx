import { useState, useEffect } from 'react'
import { Plus, ImageOff } from 'lucide-react'
import { getDisenos } from '../api/disenos.api'
import type { Diseno } from '../types/diseno.types'
import CreateDisenoModal from '../components/modals/CreateDisenoModal'
import LoadingScreen from '../components/LoadingScreen'

const DisenoCard = ({ diseno }: { diseno: Diseno }) => {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Imagen */}
      <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden">
        {diseno.imagen && !imgError ? (
          <img
            src={diseno.imagen}
            alt={diseno.nombre}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <ImageOff size={28} />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{diseno.nombre}</p>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
            diseno.activo
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {diseno.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        <p className="text-xs font-mono text-gray-400 mb-2">{diseno.codigo}</p>

        {diseno.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{diseno.descripcion}</p>
        )}

        {diseno.subcategorias && (
          <span className="inline-block text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {diseno.subcategorias.nombre}
          </span>
        )}
      </div>
    </div>
  )
}

const Disenos = () => {
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  const fetchDisenos = async () => {
    try {
      setLoading(true)
      const data = await getDisenos()
      setDisenos(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDisenos() }, [])

  const filtered = disenos.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    d.codigo?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Diseños</h1>
          <p className="text-sm text-gray-400 mt-0.5">{disenos.length} diseños registrados</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nuevo diseño
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6 max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          No se encontraron diseños
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((d) => (
            <DisenoCard key={d.id} diseno={d} />
          ))}
        </div>
      )}

      <CreateDisenoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDisenos}
      />
    </div>
  )
}

export default Disenos