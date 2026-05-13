import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, ShoppingCart, Store, User, MapPin, TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { getVentas } from '../api/venta.api'
import { getSucursales } from '../api/sucursal.api'
import type { VentaDetalle } from '../types/venta.types'
import type { Sucursal } from '../types/inventario.types'
import LoadingScreen from '../components/LoadingScreen'
import VentaModal from '../components/modals/VentaModal'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'

const Ventas = () => {
  const [ventas, setVentas] = useState<VentaDetalle[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'MATRIZ' | 'LOCALES'>('MATRIZ')
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(0)
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false)

  //Roles
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'ADMIN'
  const esVendedor = usuario?.rol === 'VENDEDOR'

  const fetchData = async () => {
    try {
      setLoading(true)
      const [ventasData, sucsData] = await Promise.all([getVentas(), getSucursales()])

      let sucursalesData = Array.isArray(sucsData) ? sucsData : []
      let ventasFiltradas = Array.isArray(ventasData)
        ? ventasData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        : []

      // 🔥 FILTRO CLAVE
      if (esVendedor && usuario?.sucursal_id) {
        sucursalesData = sucursalesData.filter(s => s.id === usuario.sucursal_id)
        ventasFiltradas = ventasFiltradas.filter(v => v.sucursal_id === usuario.sucursal_id)
      }

      setVentas(ventasFiltradas)
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

  // Filtrado de locales basado en el tipo string 'LOCAL'
  const listaLocales = useMemo(() => sucursales.filter(s => s.tipo === 'LOCAL' && s.activo), [sucursales])

  const filtradas = useMemo(() => {
    return ventas.filter((v) => {
      const perteneceASucursal = viewMode === 'MATRIZ' ? true : v.sucursal_id === selectedSucursalId
      const cumpleBusqueda =
        v.id.toString().includes(search) ||
        v.sucursales?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        v.usuarios?.nombre?.toLowerCase().includes(search.toLowerCase())
      return perteneceASucursal && cumpleBusqueda
    })
  }, [ventas, viewMode, selectedSucursalId, search])

  const totalVentasFiltradas = filtradas.filter(v => v?.estado === 'COMPLETADA').length
  const totalIngresosFiltrados = filtradas
    .filter(v => v?.estado === 'COMPLETADA')
    .reduce((acc, v) => acc + Number(v?.total ?? 0), 0)

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Ventas {viewMode === 'MATRIZ' ? 'Globales' : ''}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{filtradas.length} transacciones registradas</p>
        </div>
        {esAdmin && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit h-fit">
            <button onClick={() => setViewMode('MATRIZ')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'MATRIZ' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><Store size={14} /> Global</button>
            <button onClick={() => setViewMode('LOCALES')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'LOCALES' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}><MapPin size={14} /> Por Local</button>
          </div>
        )}
        {esVendedor && (
          <div className="flex p-1 rounded-xl w-fit">
            {usuario?.rol === 'VENDEDOR' && usuario?.nombre_sucursal && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
                <div className="flex items-center justify-center w-7 h-7 bg-blue-500 rounded-full shrink-0">
                  <Store size={16} className="text-white" />
                </div>
                <div className="flex flex-col leading-tight pr-1">
                  <span className="text-[9px] font-medium text-blue-400 tracking-tight leading-none">
                    Sucursal
                  </span>
                  <span className="text-sm font-semibold text-blue-700 truncate max-w-30 sm:max-w-50">
                    {usuario?.nombre_sucursal}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selector Local */}
      {viewMode === 'LOCALES' && esAdmin && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap gap-2">
            {listaLocales.map((s) => (
              <button key={s.id} onClick={() => setSelectedSucursalId(s.id)} className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${selectedSucursalId === s.id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200'}`}>{s.nombre}</button>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><TrendingUp size={20} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ventas Efectivas</p>
            <p className="text-xl font-black text-gray-800">{totalVentasFiltradas}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ingresos Netos</p>
            <p className="text-xl font-black text-green-600">${totalIngresosFiltrados.toLocaleString('es-EC', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Botón Añadir */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ID, local o vend..."
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white shadow-sm"
          />
        </div>
        {viewMode === 'LOCALES' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 shrink-0"
          >
            <Plus size={18} />
            Nueva Venta
          </button>
        )}
      </div>

      {/* Grid de Cards de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtradas.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-64 gap-3 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <ShoppingCart size={40} className="text-gray-200" />
            <p className="text-gray-400 text-sm font-medium">No se encontraron ventas registradas</p>
          </div>
        ) : (
          filtradas.map((v) => {
            const esCancelada = v.estado === 'CANCELADA'
            const esDevuelta = v.estado === 'DEVUELTA'
            const esParcial = v.estado === 'PARCIALMENTE_DEVUELTA'

            return (
              <div
                key={v.id}
                onClick={() => navigate(`/ventas/${v.id}`)}
                className={`cursor-pointer bg-white rounded-2xl border border-gray-200 p-4 transition-all hover:shadow-md hover:border-blue-400 group relative ${(esCancelada || esDevuelta) ? 'opacity-70' : ''}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-md w-fit">#{v.id}</span>
                    <div className="flex gap-1">
                      {esCancelada && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase">Cancelada</span>}
                      {esDevuelta && <span className="text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md uppercase">Devuelta</span>}
                      {esParcial && <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md uppercase">Parcial</span>}
                      {v.estado === 'COMPLETADA' && <span className="text-[8px] font-black bg-green-100 text-green-600 px-1.5 py-0.5 rounded-md uppercase">Completada</span>}
                    </div>
                  </div>
                  <p className={`text-lg font-black ${esDevuelta || esCancelada ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    ${Number(v.total).toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Calendar size={13} className="text-gray-400" />
                    {formatFecha(v.fecha)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <Store size={13} className="text-gray-400" />
                    <span className="truncate">{v.sucursales?.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <User size={13} className="text-gray-400" />
                    <span className="truncate">{v.usuarios?.nombre || 'Admin'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-50">
                  {(v.detalle_ventas || []).slice(0, 2).map((d, idx) => (
                    <span key={idx} className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${esDevuelta ? 'bg-gray-50 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100/50'}`}>
                      {d.disenos?.nombre || d.nodos?.nombre || 'Item'}
                    </span>
                  ))}
                  {(v.detalle_ventas?.length ?? 0) > 2 && (
                    <span className="text-[9px] font-black text-gray-400 ml-1">
                      +{(v.detalle_ventas?.length ?? 0) - 2} más
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <VentaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        sucursalId={selectedSucursalId}
        sucursalNombre={listaLocales.find(s => s.id === selectedSucursalId)?.nombre || ''}
      />
    </div>
  )
}

export default Ventas