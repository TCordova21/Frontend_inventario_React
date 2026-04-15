import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { getDisenos } from '../../api/disenos.api'
import { createVenta } from '../../api/venta.api'
import type { Diseno } from '../../types/diseno.types'
import LoadingScreen from '../../components/LoadingScreen'

interface ItemVenta {
  diseno: Diseno
  cantidad: number
  precio: number
}

const NuevaVenta = () => {
  const navigate = useNavigate()

  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ItemVenta[]>([])
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getDisenos()
      setDisenos(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtrados = disenos.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (d.codigo || '').toLowerCase().includes(search.toLowerCase())
  )

  const agregarItem = (diseno: Diseno) => {
    if (items.find(i => i.diseno.id === diseno.id)) return

    setItems(prev => [
      ...prev,
      {
        diseno,
        cantidad: 1,
        precio: Number(diseno.precio) || 0
      }
    ])
  }

  const actualizarItem = (id: number, field: 'cantidad' | 'precio', value: number) => {
    setItems(prev =>
      prev.map(i =>
        i.diseno.id === id ? { ...i, [field]: value } : i
      )
    )
  }

  const eliminarItem = (id: number) => {
    setItems(prev => prev.filter(i => i.diseno.id !== id))
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precio, 0)

  const handleSubmit = async () => {
    if (items.length === 0) return

    try {
      setSaving(true)

      await createVenta({
        usuario_id: 1,
        sucursal_id: 1,
        detalles: items.map(i => ({
          diseno_id: i.diseno.id,
          cantidad: i.cantidad,
          precio_unitario: i.precio
        }))
      })

      navigate('/ventas')

    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" size={24} />
            Nueva venta
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {items.length} productos agregados
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* IZQUIERDA — Diseños */}
        <div className="lg:col-span-2">

          {/* Buscador */}
          <div className="relative mb-4 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar diseño..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabla diseños */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Diseño</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Código</th>
                  <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-gray-400">
                      No se encontraron diseños
                    </td>
                  </tr>
                ) : (
                  filtrados.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {d.imagen && (
                            <img src={d.imagen} className="w-8 h-8 rounded-md object-cover" />
                          )}
                          <span className="text-sm text-gray-700">{d.nombre}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-gray-400">{d.codigo}</span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => agregarItem(d)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ml-auto"
                        >
                          <Plus size={12} />
                          Agregar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DERECHA — Resumen */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">

          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Detalle de venta
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No hay productos agregados
            </p>
          ) : (
            <div className="flex flex-col gap-3">

              {items.map((item) => (
                <div key={item.diseno.id} className="border border-gray-200 rounded-lg p-3">

                  <p className="text-sm font-medium text-gray-800 mb-2">
                    {item.diseno.nombre}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-2">

                    {/* Cantidad */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Cantidad</label>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(item.diseno.id, 'cantidad', Number(e.target.value))}
                        className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Precio */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-gray-400">Precio</label>
                      <input
                        type="number"
                        value={item.precio}
                        onChange={(e) => actualizarItem(item.diseno.id, 'precio', Number(e.target.value))}
                        className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Subtotal: ${(item.cantidad * item.precio).toFixed(2)}
                    </span>

                    <button
                      onClick={() => eliminarItem(item.diseno.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}

          {/* Total */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <p className="text-lg font-semibold text-gray-800 mb-3">
              Total: ${total.toFixed(2)}
            </p>

            <button
              onClick={handleSubmit}
              disabled={saving || items.length === 0}
              className="w-full py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Confirmar venta'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default NuevaVenta