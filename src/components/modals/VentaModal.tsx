import { useState, useEffect, useMemo } from 'react'
import { X, ShoppingCart, Search, Trash2, PlusCircle, Package, Layers, AlertCircle } from 'lucide-react'
import { getNodos } from '../../api/nodo.api'
import { getInventario } from '../../api/inventario.api' // Importamos inventario
import { createVenta } from '../../api/venta.api'
import type { Nodo } from '../../types/nodo.types'
import type { Inventario } from '../../types/inventario.types' // Tu tipo de inventario
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
  stockDisponible: number // Guardamos el stock calculado aquí
}

const VentaModal = ({ isOpen, onClose, onSuccess, sucursalId, sucursalNombre }: Props) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [nodos, setNodos] = useState<Nodo[]>([])
  const [inventario, setInventario] = useState<Inventario[]>([])
  const [search, setSearch] = useState('')
  const [items, setItems] = useState<ItemVenta[]>([])
  const { usuario } = useAuth()

 

  // 1. Carga de datos similar a tu página de Inventario
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return
      try {
        setLoading(true)
        const [nodList, invList] = await Promise.all([
          getNodos(),
          getInventario()
        ])
        setNodos(Array.isArray(nodList) ? nodList : [])
        setInventario(Array.isArray(invList) ? invList : [])
      } catch (error) {
        toast.error("Error al sincronizar datos de stock")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isOpen])

  // 2. Cruce de datos (La lógica de "todasLasFilas" que usas en Inventario)
  const nodosConStock = useMemo(() => {
    // Solo nos interesan los nodos raíz (Categorías/Líneas) como en tu lógica de locales
    const raices = nodos.filter(n => n.padre_id === null)
    
    return raices.map(nodo => {
      // Buscamos el registro en la tabla inventario para este nodo y esta sucursal
      const inv = inventario.find(i => i.nodo_id === nodo.id && i.sucursal_id === sucursalId)
      return {
        ...nodo,
        stockCalculado: inv ? inv.cantidad : 0
      }
    })
  }, [nodos, inventario, sucursalId])

  const filtrados = useMemo(() => 
    nodosConStock.filter(n => n.nombre.toLowerCase().includes(search.toLowerCase())),
    [nodosConStock, search]
  )

  const agregarItem = (nodo: any) => {
    if (items.find(i => i.nodo.id === nodo.id)) return
    
    if (nodo.stockCalculado <= 0) {
      toast.warning(`No hay unidades de "${nodo.nombre}" en esta sucursal`)
      return
    }

    setItems(prev => [...prev, { 
      nodo, 
      cantidad: 1, 
      precio: 0, 
      stockDisponible: nodo.stockCalculado 
    }])
  }

  const actualizarItem = (id: number, field: 'cantidad' | 'precio', value: number) => {
    setItems(prev => prev.map(i => i.nodo.id === id ? { ...i, [field]: value } : i))
  }

  const eliminarItem = (id: number) => {
    setItems(prev => prev.filter(i => i.nodo.id !== id))
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precio, 0)
  const hayErrorStock = items.some(i => i.cantidad > i.stockDisponible)

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 ">
              
              Punto de Venta
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-1">
              Atendiendo en: <span className="text-blue-600">{sucursalNombre}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Lado Izquierdo: Catálogo */}
          <div className="flex-1 p-6 overflow-y-auto border-r border-gray-50 bg-gray-50/30">
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                placeholder="Buscar por nombre..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/5 outline-none transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center opacity-30 gap-2">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-tighter">Sincronizando Stock...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {filtrados.map(nodo => {
                  const sinStock = nodo.stockCalculado <= 0;
                  return (
                    <button
                      key={nodo.id}
                      disabled={sinStock}
                      onClick={() => agregarItem(nodo)}
                      className={`group flex flex-col p-5 bg-white border-2 border-transparent rounded-[1.5rem] transition-all relative ${sinStock ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-blue-500 hover:shadow-xl'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${sinStock ? 'bg-gray-100' : 'bg-blue-50 text-blue-600'}`}>
                        <Layers size={20} />
                      </div>
                      <p className="text-[13px] font-semibold text-gray-800 text-left leading-tight mb-2">{nodo.nombre}</p>
                      
                      <div className="mt-auto flex items-center justify-between">
                         <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${sinStock ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                           Stock: {nodo.stockCalculado}
                         </span>
                         {!sinStock && <PlusCircle size={18} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Lado Derecho: Carrito/Resumen */}
          <div className="w-full md:w-96 bg-white p-6 flex flex-col border-l border-gray-50 shadow-inner">
             <h3 className="text-xs font-medium text-gray-400  mb-6 flex items-center gap-2">
              <ShoppingCart size={14} className="text-blue-600" /> Detalle de Venta
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-2">
              {items.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center opacity-20">
                  <Package size={40} strokeWidth={1} className="mb-2" />
                  <p className="text-[10px] font-black uppercase">Carrito vacío</p>
                </div>
              ) : (
                items.map(item => {
                  const error = item.cantidad > item.stockDisponible;
                  return (
                    <div key={item.nodo.id} className={`p-4 rounded-2xl border transition-all ${error ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[11px] font-black text-gray-700 uppercase pr-4">{item.nodo.nombre}</span>
                        <button onClick={() => eliminarItem(item.nodo.id)} className="text-gray-300 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">Cant. (Máx {item.stockDisponible})</label>
                          <input
                            type="number"
                            className={`w-full p-2 bg-white border rounded-xl text-xs font-black outline-none ${error ? 'border-red-400 text-red-600' : 'border-gray-200'}`}
                            value={item.cantidad}
                            onChange={(e) => actualizarItem(item.nodo.id, 'cantidad', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 block">P. Unitario</label>
                          <input
                            type="number"
                            className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-black outline-none"
                            value={item.precio}
                            step="0.01"
                            onChange={(e) => actualizarItem(item.nodo.id, 'precio', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Total Neto</p>
                  <p className="text-4xl font-black text-blue-600 tracking-tighter">${total.toFixed(2)}</p>
                </div>
                {hayErrorStock && (
                  <div className="bg-red-100 p-2 rounded-lg text-red-600">
                    <AlertCircle size={20} />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSubmit}
                disabled={items.length === 0 || saving || hayErrorStock}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
              >
                {saving ? 'Procesando...' : 'Finalizar Venta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VentaModal