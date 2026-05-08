import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, ShoppingCart, Layers} from 'lucide-react'
import { getNodos } from '../../api/nodo.api' 
import { createVenta } from '../../api/venta.api'
import type { Nodo } from '../../types/nodo.types'
import LoadingScreen from '../../components/LoadingScreen'

interface ItemVenta {
  nodo: Nodo
  cantidad: number
  precio: number
}

const NuevaVenta = () => {
  const navigate = useNavigate()
  const [nodosRaiz, setNodosRaiz] = useState<Nodo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ItemVenta[]>([])
  const [saving, setSaving] = useState(false)

  const user = JSON.parse(localStorage.getItem('user') || '{"id":1, "sucursal_id":1}')

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getNodos()
      
      // FILTRO CRUCIAL: Solo nodos que no tienen padre (Nodos Raíz)
      const raices = Array.isArray(data) 
        ? data.filter((n: any) => n.padre_id === null) 
        : []
      
      setNodosRaiz(raices)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtrados = nodosRaiz.filter((n) =>
    n.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const agregarItem = (nodo: Nodo) => {
    if (items.find(i => i.nodo.id === nodo.id)) return
    setItems(prev => [...prev, { nodo, cantidad: 1, precio: 0 }])
  }

  const actualizarItem = (id: number, field: 'cantidad' | 'precio', value: number) => {
    setItems(prev =>
      prev.map(i => i.nodo.id === id ? { ...i, [field]: value } : i)
    )
  }

  const eliminarItem = (id: number) => {
    setItems(prev => prev.filter(i => i.nodo.id !== id))
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precio, 0)

  const handleSubmit = async () => {
    if (items.length === 0) return
    try {
      setSaving(true)
      await createVenta({
        usuario_id: user.id,
        sucursal_id: user.sucursal_id,
        detalles: items.map(i => ({
          nodo_id: i.nodo.id, // ID de la categoría raíz (Ponchos, Peluches, etc.)
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
    <div className="p-6 max-w-6xl mx-auto">
      
      {/* Header Estilo Punto de Venta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
            <Layers className="text-blue-600" size={28} />
            VENTA POR CATEGORÍA
          </h1>
          <p className="text-gray-400 text-sm font-medium">Seleccione los productos raíz del stock global</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl">
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Total a Cobrar</p>
          <p className="text-3xl font-black text-blue-700">${total.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel de Selección de Raíces */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar categoría raíz..."
              className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtrados.map(nodo => (
              <button
                key={nodo.id}
                onClick={() => agregarItem(nodo)}
                className="group relative p-6 bg-white border-2 border-transparent rounded-3xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Layers size={60} />
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <p className="text-lg font-bold text-gray-800 leading-tight">{nodo.nombre}</p>
                <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-tighter">Categoría Principal</p>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de Detalles de Venta */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 shadow-2xl shadow-blue-900/5 h-fit flex flex-col min-h-125">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
              <ShoppingCart size={18} />
            </div>
            <h2 className="font-bold text-gray-800">Resumen</h2>
          </div>

          <div className="flex-1 space-y-4 mb-6 overflow-y-auto max-h-100 pr-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center opacity-30">
                <ShoppingCart size={40} className="mb-2" />
                <p className="text-xs font-bold uppercase">Esperando items...</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.nodo.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-tight">{item.nodo.nombre}</span>
                    <button onClick={() => eliminarItem(item.nodo.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Cantidad</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.cantidad}
                        onChange={(e) => actualizarItem(item.nodo.id, 'cantidad', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Precio Unit.</label>
                      <input
                        type="number"
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        value={item.precio}
                        onChange={(e) => actualizarItem(item.nodo.id, 'precio', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || items.length === 0}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm tracking-widest hover:bg-black transition-all disabled:bg-gray-200 shadow-lg shadow-gray-200"
          >
            {saving ? 'PROCESANDO...' : 'CONFIRMAR VENTA'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default NuevaVenta