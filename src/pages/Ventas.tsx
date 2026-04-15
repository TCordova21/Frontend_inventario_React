import { useState, useEffect } from 'react'
import { Plus, Search, ShoppingCart, Package } from 'lucide-react'
import { getVentas } from '../api/venta.api'
import type { Venta } from '../types/venta.types'
import LoadingScreen from '../components/LoadingScreen'
import { useNavigate } from 'react-router-dom'

const Ventas = () => {
  const navigate = useNavigate()

  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getVentas()
      setVentas(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtradas = ventas.filter((v) =>
    v.id.toString().includes(search)
  )

  const totalVentas = ventas.length
  const totalIngresos = ventas.reduce((acc, v) => acc + Number(v.total), 0)

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' ' +
    d.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={24} />
            Ventas
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {ventas.length} ventas registradas
          </p>
        </div>

        <button
          onClick={() => navigate('/ventas/nueva')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Nueva venta
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total ventas</p>
          <p className="text-2xl font-semibold text-gray-800">{totalVentas}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Ingresos</p>
          <p className="text-2xl font-semibold text-green-600">
            ${totalIngresos.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por ID de venta..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Lista */}
      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400 text-sm">No hay ventas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtradas.map((v) => {

            const preview = v.detalle_ventas?.slice(0, 2)

            return (
              <div
                key={v.id}
                onClick={() => navigate(`/ventas/${v.id}`)}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden cursor-pointer"
              >
                <div className="flex items-center gap-4 p-4">

                  {/* Icono */}
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                    <ShoppingCart size={18} className="text-blue-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800">
                        Venta #{v.id}
                      </p>
                    </div>

                    <p className="text-xs text-gray-500">
                      {formatFecha(v.fecha)}
                    </p>

                    {/* Preview diseños */}
                    {preview && preview.length > 0 && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {preview.map((d) => (
                          <span
                            key={d.id}
                            className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                          >
                            {d.disenos?.nombre || 'Sin diseño'}
                          </span>
                        ))}

                        {v.detalle_ventas.length > 2 && (
                          <span className="text-[10px] text-gray-400">
                            +{v.detalle_ventas.length - 2} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-auto">
                    <span className="text-lg font-bold text-green-600">
                      ${Number(v.total).toFixed(2)}
                    </span>

                    <span className="text-[10px] text-gray-400">
                      {v.detalle_ventas.length} items
                    </span>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Ventas