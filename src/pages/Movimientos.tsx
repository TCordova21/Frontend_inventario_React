import { useState, useEffect, useMemo } from 'react'
import { 
  ArrowRightLeft, ShoppingCart, Settings, PackageCheck, RotateCcw, 
  ChevronLeft, ChevronRight, Search, Calendar, ArrowUpDown, X 
} from 'lucide-react'
import { getMovimientos } from '../api/movimiento.api'
import { getSucursales } from '../api/sucursal.api'
import type { Movimiento } from '../types/movimiento.types'
import type { Sucursal } from '../types/inventario.types'
import LoadingScreen from '../components/LoadingScreen'

const iconTipo: Record<string, React.ReactNode> = {
  TRASLADO:   <ArrowRightLeft size={14} />,
  VENTA:      <ShoppingCart size={14} />,
  AJUSTE:     <Settings size={14} />,
  ENTRADA:    <PackageCheck size={14} />,
  DEVOLUCION: <RotateCcw size={14} />,
}

const colorTipo: Record<string, string> = {
  TRASLADO:   'bg-blue-100 text-blue-700',
  VENTA:      'bg-green-100 text-green-700',
  AJUSTE:     'bg-amber-100 text-amber-700',
  ENTRADA:    'bg-purple-100 text-purple-700',
  DEVOLUCION: 'bg-red-100 text-red-700',
}

const ITEMS_PER_PAGE = 10

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de Filtros (Siguiendo el estándar de Inventario)
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS')
  const [search, setSearch] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [orden, setOrden] = useState<'reciente' | 'antiguo' | 'alfabetico'>('reciente')
  
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [movs, sucs] = await Promise.all([getMovimientos(), getSucursales()])
      setMovimientos(Array.isArray(movs) ? movs : [])
      setSucursales(Array.isArray(sucs) ? sucs : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Resetear página cuando cambie cualquier filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [filtroTipo, search, fechaInicio, fechaFin, orden])

  const tipos = ['TODOS', 'TRASLADO', 'VENTA', 'AJUSTE', 'ENTRADA', 'DEVOLUCION']

  const filtrados = useMemo(() => {
    let result = movimientos.filter((m) => {
      const cumpleTipo = filtroTipo === 'TODOS' || m.tipo_movimiento === filtroTipo
      
      const cumpleBusqueda = 
        m.disenos?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (m.referencia || '').toLowerCase().includes(search.toLowerCase())
      
      const fechaMov = new Date(m.fecha)
      const cumpleFechaInicio = !fechaInicio || fechaMov >= new Date(fechaInicio)
      const cumpleFechaFin = !fechaFin || fechaMov <= new Date(fechaFin + 'T23:59:59')

      return cumpleTipo && cumpleBusqueda && cumpleFechaInicio && cumpleFechaFin
    })

    // Aplicar Ordenamiento
    return result.sort((a, b) => {
      if (orden === 'reciente') return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      if (orden === 'antiguo') return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      if (orden === 'alfabetico') return (a.disenos?.nombre || '').localeCompare(b.disenos?.nombre || '')
      return 0
    })
  }, [movimientos, filtroTipo, search, fechaInicio, fechaFin, orden])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const paginados = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtrados.slice(start, start + ITEMS_PER_PAGE)
  }, [filtrados, currentPage])

  const getNombreSucursal = (id: number | null) => {
    if (!id) return '—'
    return sucursales.find((s) => s.id === id)?.nombre || `Sucursal #${id}`
  }

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' + d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Movimientos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{movimientos.length} movimientos registrados</p>
        </div>
      </div>

      {/* Buscador y Filtros Secundarios (Estilo Inventario) */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por diseño o referencia..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <Calendar size={14} className="text-gray-400" />
            <input 
              type="date" 
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="text-xs text-gray-500 focus:outline-none bg-transparent"
            />
            <span className="text-gray-300">—</span>
            <input 
              type="date" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="text-xs text-gray-500 focus:outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select 
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="text-xs text-gray-500 focus:outline-none bg-transparent cursor-pointer font-medium"
            >
              <option value="reciente">Más recientes</option>
              <option value="antiguo">Más antiguos</option>
              <option value="alfabetico">Alfabético (A-Z)</option>
            </select>
          </div>

          {(search || fechaInicio || fechaFin || filtroTipo !== 'TODOS') && (
            <button 
              onClick={() => { setSearch(''); setFechaInicio(''); setFechaFin(''); setFiltroTipo('TODOS'); setOrden('reciente'); }}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              title="Limpiar filtros"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Filtros por tipo (Estilo botones de estado de Inventario) */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tipos.map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filtroTipo === tipo
                ? tipo === 'TODOS'
                  ? 'bg-gray-800 text-white border-transparent'
                  : `${colorTipo[tipo]} border-transparent`
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            {tipo}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diseño</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No se encontraron movimientos con los criterios seleccionados
                </td>
              </tr>
            ) : (
              paginados.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{formatFecha(m.fecha)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      colorTipo[m.tipo_movimiento] || 'bg-gray-100 text-gray-600'
                    }`}>
                      {iconTipo[m.tipo_movimiento]}
                      {m.tipo_movimiento}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {m.disenos ? (
                      <div className="flex items-center gap-2">
                        {m.disenos.imagen && (
                          <img
                            src={m.disenos.imagen}
                            alt={m.disenos.nombre}
                            className="w-7 h-7 rounded-md object-cover border border-gray-200 shrink-0"
                          />
                        )}
                        <span className="text-sm text-gray-700 font-medium">{m.disenos.nombre}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{getNombreSucursal(m.sucursal_origen_id)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{getNombreSucursal(m.sucursal_destino_id)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-gray-800">{m.cantidad}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-600">{m.referencia}</p>
                      {m.observacion && (
                        <p className="text-xs text-gray-400 mt-0.5">{m.observacion}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <div className="text-xs text-gray-500 font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Movimientos