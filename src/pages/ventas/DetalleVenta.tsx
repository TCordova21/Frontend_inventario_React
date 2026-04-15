import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ShoppingCart, Package } from 'lucide-react'
import { getVentaById } from '../../api/venta.api'
import type { Venta } from '../../types/venta.types'
import LoadingScreen from '../../components/LoadingScreen'

const VentaDetalle = () => {
  const { ventaId } = useParams()
  const navigate = useNavigate()

  const [venta, setVenta] = useState<Venta | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getVentaById(Number(ventaId))
      setVenta(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [ventaId])

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

  if (!venta) return (
    <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
      Venta no encontrada
    </div>
  )

  return (
    <div className="p-4 md:p-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <button
          onClick={() => navigate('/ventas')}
          className="hover:text-blue-500 transition-colors"
        >
          Ventas
        </button>

        <ChevronRight size={14} className="shrink-0" />

        <span className="text-gray-700 font-medium">
          Venta #{venta.id}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={22} />
            Venta #{venta.id}
          </h1>

          <p className="text-sm text-gray-400 mt-0.5">
            {formatFecha(venta.fecha)}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <span className="text-xs text-gray-400">Total</span>
          <span className="text-2xl font-bold text-green-600">
            ${Number(venta.total).toFixed(2)}
          </span>
        </div>

      </div>

      {/* Lista de productos */}
      {venta.detalle_ventas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400 text-sm">Esta venta no tiene items</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">

          {venta.detalle_ventas.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">

                {/* Imagen */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                  {d.disenos?.imagen ? (
                    <img
                      src={d.disenos.imagen}
                      alt={d.disenos.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {d.disenos?.nombre || 'Sin diseño'}
                    </p>

                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      x{d.cantidad}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-gray-400">
                    {d.disenos?.codigo || '—'}
                  </p>
                </div>

                {/* Precio */}
                <div className="flex flex-col items-end gap-1 shrink-0 ml-auto">
                  <span className="text-sm text-gray-500">
                    ${Number(d.precio_unitario).toFixed(2)}
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    ${(Number(d.precio_unitario) * d.cantidad).toFixed(2)}
                  </span>
                </div>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  )
}

export default VentaDetalle