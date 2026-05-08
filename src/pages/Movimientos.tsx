import { useState, useEffect, useMemo } from 'react'
import {
  ArrowRightLeft, ShoppingCart, Settings, PackageCheck, RotateCcw,
  ChevronLeft, ChevronRight, Search, Calendar, ArrowUpDown,
  CheckCircle2, Clock, Store, MapPin, User
} from 'lucide-react'
import { getMovimientos, confirmarMovimiento } from '../api/movimiento.api'
import { getSucursales } from '../api/sucursal.api'
import type { Movimiento } from '../types/movimiento.types'
import type { Sucursal } from '../types/inventario.types'
import LoadingScreen from '../components/LoadingScreen'
import ConfirmarMovimientoModal from '../components/modals/ConfirmarMovimientoModal'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

const iconTipo: Record<string, React.ReactNode> = {
  TRASLADO: <ArrowRightLeft size={14} />,
  VENTA: <ShoppingCart size={14} />,
  AJUSTE: <Settings size={14} />,
  ENTRADA: <PackageCheck size={14} />,
  DEVOLUCION: <RotateCcw size={14} />,
  RETORNO_MATRIZ: <RotateCcw size={14} />,
}

const colorTipo: Record<string, string> = {
  TRASLADO: 'bg-blue-100 text-blue-700',
  VENTA: 'bg-green-100 text-green-700',
  AJUSTE: 'bg-amber-100 text-amber-700',
  ENTRADA: 'bg-purple-100 text-purple-700',
  DEVOLUCION: 'bg-red-100 text-red-700',
  RETORNO_MATRIZ: 'bg-rose-100 text-rose-700',
}

const ITEMS_PER_PAGE = 10

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [allSucursales, setAllSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [viewMode, setViewMode] = useState<'MATRIZ' | 'LOCALES'>('MATRIZ')
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(0)
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS')
  const [search, setSearch] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [orden, setOrden] = useState<'reciente' | 'antiguo' | 'alfabetico'>('reciente')
  const [currentPage, setCurrentPage] = useState(1)

  //Roles
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'ADMIN'
  const esVendedor = usuario?.rol === 'VENDEDOR'


  const fetchData = async () => {
    try {
      setLoading(true)
      const [movs, sucs] = await Promise.all([getMovimientos(), getSucursales()])

      const allSucursalesData = Array.isArray(sucs)
        ? sucs
        : []

      let sucursalesData = [...allSucursalesData]
      let movimientosData = Array.isArray(movs) ? movs : []

      // 🔥 FILTRO CLAVE (igual que inventario)
      if (esVendedor && usuario?.sucursal_id) {
        sucursalesData = sucursalesData.filter(s => s.id === usuario.sucursal_id)

        movimientosData = movimientosData.filter(m =>
          m.sucursal_origen_id === usuario.sucursal_id ||
          m.sucursal_destino_id === usuario.sucursal_id
        )
      }

      setMovimientos(movimientosData)
      setAllSucursales(allSucursalesData)
      setSucursales(sucursalesData)

      if (selectedSucursalId === 0 && sucursalesData.length > 0) {
        setSelectedSucursalId(sucursalesData[0].id)
      }

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])



  useEffect(() => {
    if (esVendedor && usuario?.sucursal_id) {
      setViewMode('LOCALES')
      setSelectedSucursalId(usuario.sucursal_id)
    }
  }, [usuario])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filtroTipo, viewMode, selectedSucursalId, fechaInicio, fechaFin])

  const handleConfirmarFinal = async (id: number, data: { cantidad_confirmada: number; fecha_confirmacion: string, usuario_confirmacion_id: number }) => {
    try {
      await confirmarMovimiento(id, data);
      toast.success('Movimiento confirmado exitosamente');
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error en confirmación:', error);
      toast.error('Error al confirmar el movimiento');
    }
  };

  // Filtrado basado en el atributo string 'LOCAL'
  const listaLocales = useMemo(() => sucursales.filter(s => s.tipo === 'LOCAL' && s.activo), [sucursales])

  const filtrados = useMemo(() => {
    let result = movimientos.filter((m) => {
      const perteneceASucursal = viewMode === 'MATRIZ'
        ? true
        : (m.sucursal_origen_id === selectedSucursalId || m.sucursal_destino_id === selectedSucursalId)

      const cumpleTipo = filtroTipo === 'TODOS' || m.tipo_movimiento === filtroTipo
      const cumpleBusqueda =
        (m.disenos?.nombre || m.nodos?.nombre || '').toLowerCase().includes(search.toLowerCase()) ||
        (m.usuarios?.nombre || '').toLowerCase().includes(search.toLowerCase())

      const fechaMov = new Date(m.fecha)
      const cumpleFechaInicio = !fechaInicio || fechaMov >= new Date(fechaInicio)
      const cumpleFechaFin = !fechaFin || fechaMov <= new Date(fechaFin + 'T23:59:59')

      return perteneceASucursal && cumpleTipo && cumpleBusqueda && cumpleFechaInicio && cumpleFechaFin
    })

    return result.sort((a, b) => {
      if (orden === 'reciente') return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      if (orden === 'antiguo') return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
      if (orden === 'alfabetico') return (a.disenos?.nombre || a.nodos?.nombre || '').localeCompare(b.disenos?.nombre || b.nodos?.nombre || '')
      return 0
    })
  }, [movimientos, filtroTipo, search, fechaInicio, fechaFin, orden, viewMode, selectedSucursalId])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const paginados = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtrados.slice(start, start + ITEMS_PER_PAGE)
  }, [filtrados, currentPage])

  const getNombreSucursal = (id: number | null) => {
    if (!id) return '—'

    return (
      allSucursales.find((s) => s.id === id)?.nombre ||
      `Sucursal #${id}`
    )
  }

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return null
    const d = new Date(fecha)
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Movimientos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtrados.length} movimientos encontrados</p>
        </div>
        {esAdmin && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button onClick={() => setViewMode('MATRIZ')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'MATRIZ' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><Store size={14} /> Global</button>
            <button onClick={() => setViewMode('LOCALES')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'LOCALES' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><MapPin size={14} /> Por Sucursal</button>
          </div>
        )}
        {esVendedor && (
          <div className="flex  p-1 rounded-xl w-fit">
            {usuario?.rol === 'VENDEDOR' && usuario?.nombre_sucursal && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                <div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full shrink-0">
                  <Store size={16} className="text-white" />
                </div>
                <div className="flex flex-col leading-tight pr-1">
                  <span className="text-[9px] font-medium text-blue-400  tracking-tight leading-none">
                    Sucursal
                  </span>
                  <span className="text-sm font-semibold text-blue-700 truncate max-w-[120px] sm:max-w-[200px]">
                    {usuario?.nombre_sucursal}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {esAdmin && viewMode === 'LOCALES' && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-2">
            {listaLocales.map((s) => (
              <button key={s.id} onClick={() => setSelectedSucursalId(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSucursalId === s.id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}>{s.nombre}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar diseño o responsable..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1">
            <Calendar size={14} className="text-gray-400" />
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="text-xs text-gray-500 bg-transparent outline-none" />
            <span className="text-gray-300">—</span>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="text-xs text-gray-500 bg-transparent outline-none" />
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1">
            <ArrowUpDown size={14} className="text-gray-400" />
            <select value={orden} onChange={(e) => setOrden(e.target.value as any)} className="text-xs text-gray-500 bg-transparent outline-none font-medium">
              <option value="reciente">Más recientes</option>
              <option value="antiguo">Más antiguos</option>
              <option value="alfabetico">Alfabético</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['TODOS', 'TRASLADO', 'VENTA', 'AJUSTE', 'ENTRADA', 'DEVOLUCION', 'RETORNO_MATRIZ'].map((tipo) => (
          <button key={tipo} onClick={() => setFiltroTipo(tipo)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filtroTipo === tipo ? (tipo === 'TODOS' ? 'bg-gray-800 text-white' : `${colorTipo[tipo]} border-transparent`) : 'bg-white text-gray-500 border-gray-200'}`}>{tipo.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Fechas (Env/Conf)</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Diseño / Nodo</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Origen / Destino</th>
              <th className="px-4 py-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">Cant (E/R)</th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Responsables</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-400 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginados.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No hay movimientos</td></tr>
            ) : (
              paginados.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-medium">{formatFecha(m.fecha)}</span>
                      {m.fecha_confirmacion && (
                        <span className="text-[10px] text-green-600 font-medium">Confirmado: {formatFecha(m.fecha_confirmacion)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase ${colorTipo[m.tipo_movimiento] || 'bg-gray-100 text-gray-600'}`}>
                      {iconTipo[m.tipo_movimiento]} {m.tipo_movimiento.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                        <img
                          src={m.disenos?.imagen || m.nodos?.imagen || '/placeholder.png'}
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-700 font-medium">{m.disenos?.nombre || m.nodos?.nombre}</span>
                        {!m.disenos && <span className="text-[9px] text-blue-500 font-bold uppercase">Stock Global</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 uppercase font-medium">De: {getNombreSucursal(m.sucursal_origen_id)}</span>
                      <span className="text-[10px] text-blue-600 uppercase font-medium">A: {getNombreSucursal(m.sucursal_destino_id)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-gray-800">{m.cantidad}</span>
                      {m.cantidad_confirmada !== null && (
                        <span className={`text-[10px] font-semibold px-1 rounded ${m.tipo_movimiento === 'AJUSTE'
                          ? 'bg-gray-100 text-gray-600'
                          : (m.cantidad_confirmada !== m.cantidad ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')
                          }`}>
                          {m.tipo_movimiento === 'AJUSTE' ? 'Anterior: ' : 'Entrada: '}
                          {m.cantidad_confirmada}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {/* Quien envió */}
                      <div className="flex items-center gap-2 text-gray-500">
                        <User size={10} className="shrink-0" />
                        <p className="text-[10px] font-medium truncate max-w-[100px]">
                          {m.usuarios?.nombre || 'Admin'}
                        </p>
                      </div>

                      {/* Quien confirmó (solo si existe) */}
                      {m.usuarios_movimientos_inventario_usuario_confirmacion_idTousuarios && (
                        <div className="flex items-center gap-2 text-blue-600 border-t border-gray-50 pt-1">
                          <CheckCircle2 size={10} className="shrink-0" />
                          <p className="text-[10px] font-bold truncate max-w-[100px]">
                            {m.usuarios_movimientos_inventario_usuario_confirmacion_idTousuarios.nombre}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {m.estado === 'PENDIENTE' ? (
                      (() => {
                        // Admin siempre puede confirmar
                        // Vendedor NO puede confirmar su propio movimiento
                        const esPropioMovimiento = esVendedor && m.usuario_id === usuario?.id

                        return (
                          <button
                            onClick={() => { setSelectedMovimiento(m); setIsModalOpen(true) }}
                            disabled={esPropioMovimiento}
                            title={esPropioMovimiento ? 'No puedes confirmar tu propio movimiento' : 'Confirmar recepción'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shadow-sm transition-all ${esPropioMovimiento
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                              }`}
                          >
                            <Clock size={12} />
                            {esPropioMovimiento ? 'Pendiente' : 'Confirmar'}
                          </button>
                        )
                      })()
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                        <CheckCircle2 size={12} /> Completado
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <div className="text-[10px] font-medium text-gray-400 ">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmarMovimientoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movimiento={selectedMovimiento}
        onConfirm={handleConfirmarFinal}
      />
    </div>
  )
}

export default Movimientos