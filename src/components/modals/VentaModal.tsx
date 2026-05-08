import { useState, useEffect, useMemo } from 'react'
import { X, ShoppingCart, Search, Trash2, Package, Layers,  ArrowLeft } from 'lucide-react'
import { getNodos } from '../../api/nodo.api'
import { getInventario } from '../../api/inventario.api' 
import { createVenta } from '../../api/venta.api'
import type { Nodo } from '../../types/nodo.types'
import type { Inventario } from '../../types/inventario.types' 
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sucursalId: number
  sucursalNombre: string
}

interface ItemVenta {
  nodo: Nodo
  cantidad: number
  precio: number
  stockDisponible: number 
}
// ... (imports y interfaces se mantienen igual)

const VentaModal = ({ isOpen, onClose, onSuccess, sucursalId, sucursalNombre }: Props) => {
  const [, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nodos, setNodos] = useState<Nodo[]>([])
  const [inventario, setInventario] = useState<Inventario[]>([])
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ItemVenta[]>([])
  const [showCartMobile, setShowCartMobile] = useState(false) 
  const { usuario } = useAuth()

  // Sincronización de datos
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return
      try {
        setLoading(true)
        const [nodList, invList] = await Promise.all([getNodos(), getInventario()])
        setNodos(Array.isArray(nodList) ? nodList : [])
        setInventario(Array.isArray(invList) ? invList : [])
      } catch (error) {
        toast.error("Error al sincronizar stock")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isOpen])

  // Lógica de Negocio (Memoized)
  const nodosConStock = useMemo(() => {
    const raices = nodos.filter(n => n.padre_id === null)
    return raices.map(nodo => {
      const inv = inventario.find(i => i.nodo_id === nodo.id && i.sucursal_id === sucursalId)
      return { ...nodo, stockCalculado: inv ? inv.cantidad : 0 }
    })
  }, [nodos, inventario, sucursalId])

  const filtrados = useMemo(() => 
    nodosConStock.filter(n => n.nombre.toLowerCase().includes(search.toLowerCase())),
    [nodosConStock, search]
  )

  // Acciones del Carrito
  const agregarItem = (nodo: any) => {
    if (items.find(i => i.nodo.id === nodo.id)) return
    if (nodo.stockCalculado <= 0) return toast.warning("Sin stock disponible")
    setItems(prev => [...prev, { nodo, cantidad: 1, precio: 0, stockDisponible: nodo.stockCalculado }])
  }

  const actualizarItem = (id: number, field: 'cantidad' | 'precio', value: number) => {
    setItems(prev => prev.map(i => i.nodo.id === id ? { ...i, [field]: value } : i))
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precio, 0)
  const hayErrorStock = items.some(i => i.cantidad > i.stockDisponible)

  // LÓGICA DE ENVÍO RESTAURADA
  const handleSubmit = async () => {
    if (items.length === 0 || hayErrorStock) return
    try {
      setSaving(true)
      await createVenta({
        usuario_id: usuario?.id,
        sucursal_id: sucursalId,
        detalles: items.map(i => ({
          nodo_id: i.nodo.id,
          cantidad: i.cantidad,
          precio_unitario: i.precio
        }))
      })
      toast.success("Venta procesada con éxito")
      setItems([])
      onSuccess()
      onClose()
    } catch (error: any) {
      toast.error("Error al registrar venta")
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-4xl md:rounded-4xl shadow-2xl w-full max-w-5xl h-full md:h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 px-7 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            {showCartMobile && (
              <button onClick={() => setShowCartMobile(false)} className="md:hidden p-2 bg-gray-50 rounded-xl text-gray-600">
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Punto de Venta</h2>
              <p className="text-xs text-gray-400 font-medium">Sucursal: <span className="text-blue-600">{sucursalNombre}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-row">
          {/* Lado Izquierdo: Catálogo */}
          <div className={`${showCartMobile ? 'hidden' : 'flex'} md:flex flex-1 p-6 overflow-y-auto bg-gray-50/30 flex-col`}>
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                placeholder="Buscar por nombre..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm outline-none shadow-sm focus:ring-4 focus:ring-blue-500/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {filtrados.map(nodo => (
                <button
                  key={nodo.id}
                  disabled={nodo.stockCalculado <= 0}
                  onClick={() => agregarItem(nodo)}
                  className={`group flex flex-col p-5 bg-white border-2 items-center border-transparent rounded-3xl transition-all ${nodo.stockCalculado <= 0 ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-300 hover:shadow-xl'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${nodo.stockCalculado <= 0 ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'}`}>
                    <Layers size={20} />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-800 text-center leading-tight mb-2">{nodo.nombre}</p>
                  <span className={`px-2 py-1 rounded-lg w-full text-[9px] font-semibold uppercase ${nodo.stockCalculado <= 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    Stock: {nodo.stockCalculado}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Lado Derecho: Carrito */}
          <div className={`${showCartMobile ? 'flex' : 'hidden'} md:flex w-full md:w-96 bg-white p-6 flex-col border-l border-gray-50 shadow-inner overflow-hidden`}>
            <h3 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2 ">
              <ShoppingCart size={14} className="text-blue-600" /> Detalle de Venta
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
              {items.length === 0 ? (
                <div className="text-center py-20 opacity-20 flex flex-col items-center">
                  <Package size={40} strokeWidth={1} className="mb-2" />
                  <p className="text-[10px] font-black uppercase">Carrito vacío</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.nodo.id} className={`p-2 rounded-2xl border transition-all ${item.cantidad > item.stockDisponible ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[11px] font-black text-gray-700 uppercase pr-4">{item.nodo.nombre}</span>
                      <button onClick={() => setItems(prev => prev.filter(i => i.nodo.id !== item.nodo.id))} className="text-gray-300 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Cant.</label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded-xl text-xs font-black outline-none" value={item.cantidad} onChange={(e) => actualizarItem(item.nodo.id, 'cantidad', Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">P. Unit</label>
                        <input type="number" className="w-full p-2 border border-gray-200 rounded-xl text-xs font-black outline-none" value={item.precio} step="0.01" onChange={(e) => actualizarItem(item.nodo.id, 'precio', Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-1 border-t border-gray-100 bg-white shrink-0">
              <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Neto</p>
              <p className="text-3xl font-black text-blue-600 mb-6 tracking-tighter">${total.toFixed(2)}</p>
              <button 
                onClick={handleSubmit}
                disabled={items.length === 0 || saving || hayErrorStock}
                className="w-full py-3 bg-gray-900 text-white rounded-2xl font-medium text-sm  hover:bg-black transition-all disabled:bg-gray-100 disabled:text-gray-400"
              >
                {saving ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </div>
          </div>
        </div>

        {/* FAB (Botón flotante) solo para móvil */}
        {!showCartMobile && items.length > 0 && (
          <button 
            onClick={() => setShowCartMobile(true)}
            className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 active:scale-95 transition-transform z-10"
          >
            <ShoppingCart size={20} />
            <span className="font-bold text-xs bg-white text-blue-600 px-2 py-0.5 rounded-lg">{items.length}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default VentaModal