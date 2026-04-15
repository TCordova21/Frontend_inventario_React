import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, AlertTriangle, Package, TrendingDown, Store, MapPin, Copy, Check } from 'lucide-react'
import { getInventario } from '../../api/inventario.api'
import { getDisenos } from '../../api/disenos.api'
import { getSucursales } from '../../api/sucursal.api' 
import type { Inventario as InventarioType, Sucursal } from '../../types/inventario.types'
import type { Diseno } from '../../types/diseno.types'
import StockModal from '../../components/modals/StockModal'
import LoadingScreen from '../../components/LoadingScreen'

const MATRIZ_ID = 1

const Inventario = () => {
  const [inventario, setInventario] = useState<InventarioType[]>([])
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([]) // 2. Estado para la lista maestra de sucursales
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'BAJO' | 'SIN'>('TODOS')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  
  const [viewMode, setViewMode] = useState<'MATRIZ' | 'LOCALES'>('MATRIZ')
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(0)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDiseno, setSelectedDiseno] = useState<Diseno | null>(null)
  const [selectedInventario, setSelectedInventario] = useState<InventarioType | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      // 3. Obtenemos inventario, diseños y sucursales en paralelo
      const [inv, dis, sucs] = await Promise.all([
        getInventario(), 
        getDisenos(), 
        getSucursales()
      ])
      
      setInventario(Array.isArray(inv) ? inv : [])
      setDisenos(Array.isArray(dis) ? dis : [])
      setSucursales(Array.isArray(sucs) ? sucs : [])
      
      // 4. Seleccionamos el primer local disponible si no hay uno seleccionado
      if (selectedSucursalId === 0) {
        const primerLocal = sucs.find((s: Sucursal) => s.id !== MATRIZ_ID && s.activo)
        if (primerLocal) setSelectedSucursalId(primerLocal.id)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // 5. Ahora listaLocales se deriva directamente de las sucursales de la DB
  const listaLocales = useMemo(() => {
    return sucursales.filter(s => s.id !== MATRIZ_ID && s.activo)
  }, [sucursales])

  const todasLasFilas = useMemo(() => {
    const sucursalActual = viewMode === 'MATRIZ' ? MATRIZ_ID : selectedSucursalId
    const invFiltrado = inventario.filter((i) => i.sucursal_id === sucursalActual)

    return disenos.map((diseno) => {
      const inv = invFiltrado.find((i) => i.diseno_id === diseno.id) || null
      return { diseno, inv }
    })
  }, [inventario, disenos, viewMode, selectedSucursalId])

  const filasFiltradas = useMemo(() => {
    return todasLasFilas.filter(({ diseno, inv }) => {
      const cumpleBusqueda = diseno.nombre.toLowerCase().includes(search.toLowerCase()) ||
                             (diseno.codigo || '').toLowerCase().includes(search.toLowerCase())
      
      const stockBajo = inv && inv.cantidad <= inv.stock_minimo && inv.cantidad > 0
      const sinStock = !inv || inv.cantidad === 0

      if (filtroEstado === 'BAJO') return cumpleBusqueda && stockBajo
      if (filtroEstado === 'SIN') return cumpleBusqueda && sinStock
      return cumpleBusqueda
    })
  }, [todasLasFilas, search, filtroEstado])

  const metrics = useMemo(() => {
    return {
      total: todasLasFilas.length,
      conStock: todasLasFilas.filter(f => f.inv && f.inv.cantidad > 0).length,
      stockBajo: todasLasFilas.filter(f => f.inv && f.inv.cantidad <= f.inv.stock_minimo && f.inv.cantidad > 0).length,
      sinStock: todasLasFilas.filter(f => !f.inv || f.inv.cantidad === 0).length
    }
  }, [todasLasFilas])

  const handleOpenModal = (diseno: Diseno, inv: InventarioType | null) => {
    setSelectedDiseno(diseno)
    setSelectedInventario(inv)
    setModalOpen(true)
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Inventario</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de existencias por punto de venta</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => { setViewMode('MATRIZ'); setFiltroEstado('TODOS'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'MATRIZ' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store size={14} /> Matriz Principal
          </button>
          <button
            onClick={() => { setViewMode('LOCALES'); setFiltroEstado('TODOS'); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'LOCALES' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin size={14} /> Otros Locales
          </button>
        </div>
      </div>

      {/* Selector de Sucursal */}
      {viewMode === 'LOCALES' && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Seleccionar Sucursal</label>
          <div className="flex flex-wrap gap-2">
            {listaLocales.map((sucursal) => (
              <button
                key={sucursal.id}
                onClick={() => setSelectedSucursalId(sucursal.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedSucursalId === sucursal.id
                  ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {sucursal.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total diseños</p>
          <p className="text-2xl font-semibold text-gray-800">{metrics.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Con stock</p>
          <p className="text-2xl font-semibold text-green-600">{metrics.conStock}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1.5 mb-1 text-amber-500">
            <TrendingDown size={12} />
            <p className="text-xs text-gray-400">Stock bajo</p>
          </div>
          <p className="text-2xl font-semibold text-amber-500">{metrics.stockBajo}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-red-500">
          <div className="flex items-center gap-1.5 mb-1">
            <Package size={12} className="text-red-400" />
            <p className="text-xs text-gray-400">Sin stock</p>
          </div>
          <p className="text-2xl font-semibold text-red-500">{metrics.sinStock}</p>
        </div>
      </div>

      {/* Buscador y Filtros de Estado */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar diseño..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
        
        <div className="flex gap-2">
          {['TODOS', 'BAJO', 'SIN'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado as any)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                filtroEstado === estado
                ? 'bg-gray-800 text-white border-transparent'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {estado === 'SIN' ? 'SIN STOCK' : estado === 'BAJO' ? 'STOCK BAJO' : 'TODOS'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diseño</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock actual</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              filasFiltradas.map(({ diseno, inv }) => {
                const stockBajoFlag = inv && inv.cantidad <= inv.stock_minimo && inv.cantidad > 0
                const sinStockFlag = !inv || inv.cantidad === 0

                return (
                  <tr key={diseno.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                          {diseno.imagen ? (
                            <img src={diseno.imagen} alt={diseno.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={14} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800">{diseno.nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 group">
                        <span className="text-xs font-mono text-gray-400">{diseno.codigo || '—'}</span>
                        {diseno.codigo && (
                          <button 
                            onClick={() => handleCopy(diseno.codigo!, diseno.id)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-300 hover:text-blue-500 transition-colors"
                            title="Copiar código"
                          >
                            {copiedId === diseno.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-sm">
                        {inv?.cantidad || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sinStockFlag ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold uppercase">Sin stock</span>
                      ) : stockBajoFlag ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-semibold uppercase inline-flex items-center gap-1">
                          <AlertTriangle size={10} /> Bajo
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold uppercase">OK</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenModal(diseno, inv)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto flex items-center gap-1"
                      >
                        <Plus size={12} />
                        {inv ? 'Movimiento' : 'Añadir'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <StockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
        inventario={selectedInventario}
        disenoId={selectedDiseno?.id || 0}
        disenoNombre={selectedDiseno?.nombre || ''}
        sucursalId={viewMode === 'MATRIZ' ? MATRIZ_ID : selectedSucursalId}
        sucursalNombre={viewMode === 'MATRIZ' 
          ? 'Matriz Principal' 
          : sucursales.find(s => s.id === selectedSucursalId)?.nombre || 'Sucursal Local'
        }
        sucursales={sucursales} // 6. Enviamos la lista maestra completa al modal
      />
    </div>
  )
}

export default Inventario