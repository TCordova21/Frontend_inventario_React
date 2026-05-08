import { useState, useEffect, useMemo } from 'react'
import {
  Search, Plus, AlertTriangle, Package, TrendingDown,
  Store, MapPin, Copy, Check, Clock, ChevronLeft, ChevronRight
} from 'lucide-react'

// API e Interfaces
import { getInventario } from '../../api/inventario.api'
import { getDisenos } from '../../api/disenos.api'
import { getSucursales } from '../../api/sucursal.api'
import { getNodos } from '../../api/nodo.api'
import type { Inventario as InventarioType, Sucursal } from '../../types/inventario.types'
import type { Diseno } from '../../types/diseno.types'

// Componentes
import StockModal from '../../components/modals/StockModal'
import LoadingScreen from '../../components/LoadingScreen'
import { useAuth } from '../../context/AuthContext'

const Inventario = () => {
  // --- ESTADOS ---
  const [inventario, setInventario] = useState<InventarioType[]>([])
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [nodos, setNodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<'TODOS' | 'BAJO' | 'SIN'>('TODOS')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // Modos de Vista y Paginación
  const [viewMode, setViewMode] = useState<'MATRIZ' | 'LOCALES'>('MATRIZ')
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // Modales
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDiseno, setSelectedDiseno] = useState<any | null>(null)
  const [selectedInventario, setSelectedInventario] = useState<InventarioType | null>(null)
  const [allSucursales, setAllSucursales] = useState<Sucursal[]>([])

  //Roles
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === 'ADMIN'
  const esVendedor = usuario?.rol === 'VENDEDOR'



  // --- CARGA DE DATOS ---
  const fetchData = async () => {
    try {
      setLoading(true)
      const [inv, dis, sucs, nodList] = await Promise.all([
        getInventario(),
        getDisenos(),
        getSucursales(),
        getNodos()
      ])

      const allSucursalesData = Array.isArray(sucs) ? sucs : []
      let sucursalesData = [...allSucursalesData]
      let inventarioData = Array.isArray(inv) ? inv : []



      // 🔥 FILTRO CLAVE
      if (esVendedor && usuario?.sucursal_id) {
        sucursalesData = sucursalesData.filter(s => s.id === usuario.sucursal_id)
        inventarioData = inventarioData.filter(i => i.sucursal_id === usuario.sucursal_id)
      }

      setInventario(inventarioData)

      const disenosData = Array.isArray(dis) ? [...dis].reverse() : []
      setDisenos(disenosData)

      setAllSucursales(allSucursalesData)
      setSucursales(sucursalesData)
      setNodos(Array.isArray(nodList) ? nodList : [])

      if (selectedSucursalId === 0 && sucursalesData.length > 0) {
        setSelectedSucursalId(sucursalesData[0].id)
      }

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!usuario) return // esperar a que el contexto cargue

    fetchData()
  }, [usuario])



  useEffect(() => {
    if (esVendedor && usuario?.sucursal_id) {
      setViewMode('LOCALES')
      setSelectedSucursalId(usuario.sucursal_id)
    }
  }, [usuario])

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filtroEstado, viewMode, selectedSucursalId])

  // --- HANDLERS ---
  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const listaMatrices = useMemo(() => sucursales.filter(s => s.tipo?.toLowerCase() === 'matriz' && s.activo), [sucursales])
  const listaLocales = useMemo(() => sucursales.filter(s => s.tipo?.toLowerCase() === 'local' && s.activo), [sucursales])

  const handleViewModeChange = (mode: 'MATRIZ' | 'LOCALES') => {
    setViewMode(mode)
    const lista = mode === 'MATRIZ' ? listaMatrices : listaLocales
    if (lista.length > 0) setSelectedSucursalId(lista[0].id)
    setFiltroEstado('TODOS')
  }

  const handleOpenModal = (fila: any) => {
    if (viewMode === 'LOCALES' && !fila.inv) return;
    setSelectedDiseno(fila.originalDiseno)
    setSelectedInventario(fila.inv)
    setModalOpen(true)
  }

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---
  const todasLasFilas = useMemo(() => {
    const sucursalActual = sucursales.find(s => s.id === selectedSucursalId)
    const esMatriz = sucursalActual?.tipo?.toLowerCase() === 'matriz'
    const invFiltrado = inventario.filter((i) => i.sucursal_id === selectedSucursalId)

    if (esMatriz) {
      return disenos.map((diseno) => {
        const inv = invFiltrado.find((i) => i.diseno_id === diseno.id) || null
        return { id: diseno.id, nombre: diseno.nombre, codigo: diseno.codigo, imagen: diseno.imagen, inv, originalDiseno: diseno }
      })
    } else {
      const nodosRaiz = nodos.filter(n => n.padre_id === null)
      return nodosRaiz.map((nodo) => {
        const inv = invFiltrado.find((i) => i.nodo_id === nodo.id && i.diseno_id === null) || null
        return { id: nodo.id, nombre: nodo.nombre, codigo: 'STOCK GLOBAL', imagen: nodo.imagen || null, inv, originalDiseno: { id: 0, nombre: nodo.nombre, nodo_id: nodo.id, nodo } }
      })
    }
  }, [inventario, disenos, selectedSucursalId, sucursales, nodos])

  const filasFiltradas = useMemo(() => {
    return todasLasFilas.filter(({ nombre, codigo, inv }) => {
      const cumpleBusqueda = nombre.toLowerCase().includes(search.toLowerCase()) || (codigo || '').toLowerCase().includes(search.toLowerCase())
      const stockBajo = inv && inv.cantidad <= (inv.stock_minimo || 0) && inv.cantidad > 0
      const sinStock = !inv || inv.cantidad === 0
      if (filtroEstado === 'BAJO') return cumpleBusqueda && stockBajo
      if (filtroEstado === 'SIN') return cumpleBusqueda && sinStock
      return cumpleBusqueda
    })
  }, [todasLasFilas, search, filtroEstado])

  const totalPages = Math.ceil(filasFiltradas.length / rowsPerPage)
  const filasPaginadas = useMemo(() => {
    const lastIndex = currentPage * rowsPerPage
    const firstIndex = lastIndex - rowsPerPage
    return filasFiltradas.slice(firstIndex, lastIndex)
  }, [filasFiltradas, currentPage])

  const metrics = useMemo(() => ({
    total: todasLasFilas.length,
    conStock: todasLasFilas.filter(f => f.inv && f.inv.cantidad > 0).length,
    stockBajo: todasLasFilas.filter(f => f.inv && f.inv.cantidad <= (f.inv.stock_minimo || 0) && f.inv.cantidad > 0).length,
    sinStock: todasLasFilas.filter(f => !f.inv || f.inv.cantidad === 0).length
  }), [todasLasFilas])

  if (loading) return <LoadingScreen />

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Inventario </h1>
          <p className="text-sm text-gray-400 mt-0.5">Gestión de existencias Elitex</p>
        </div>

        {esAdmin && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button onClick={() => handleViewModeChange('MATRIZ')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'MATRIZ' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><Store size={14} /> Matrices</button>
            <button onClick={() => handleViewModeChange('LOCALES')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'LOCALES' ? 'bg-white text-violet-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><MapPin size={14} /> Locales</button>
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

      {/* Selector de Sucursal */}
      {esAdmin && (
        <div className="mb-6">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Sucursal de {viewMode === 'MATRIZ' ? 'Matriz' : 'Local'}</label>
          <div className="flex flex-wrap gap-2">
            {(viewMode === 'MATRIZ' ? listaMatrices : listaLocales).map((sucursal) => (
              <button key={sucursal.id} onClick={() => setSelectedSucursalId(sucursal.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSucursalId === sucursal.id ? viewMode === 'MATRIZ' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-violet-50 text-violet-700 border-violet-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>{sucursal.nombre}</button>
            ))}
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-400 mb-1">{viewMode === 'MATRIZ' ? 'Total diseños' : 'Total categorías'}</p><p className="text-2xl font-semibold text-gray-800">{metrics.total}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><p className="text-xs text-gray-400 mb-1">Con stock</p><p className="text-2xl font-semibold text-green-500">{metrics.conStock}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-1.5 mb-1 text-amber-500"><TrendingDown size={12} /><p className="text-xs text-gray-400">Stock bajo</p></div><p className="text-2xl font-semibold text-amber-500">{metrics.stockBajo}</p></div>
        <div className="bg-white rounded-xl border border-gray-200 p-4"><div className="flex items-center gap-1.5 mb-1 text-red-500"><Package size={12} /><p className="text-xs text-gray-400">Sin stock</p></div><p className="text-2xl font-semibold text-red-500">{metrics.sinStock}</p></div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={viewMode === 'MATRIZ' ? "Buscar diseño..." : "Buscar categoría..."} className={`w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 transition ${viewMode === 'MATRIZ' ? 'focus:ring-blue-500' : 'focus:ring-green-500'}`} />
        </div>
        <div className="flex gap-2">
          {['TODOS', 'BAJO', 'SIN'].map((estado) => (
            <button key={estado} onClick={() => setFiltroEstado(estado as any)} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${filtroEstado === estado ? 'bg-gray-800 text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>{estado === 'SIN' ? 'SIN STOCK' : estado === 'BAJO' ? 'STOCK BAJO' : 'TODOS'}</button>
          ))}
        </div>
      </div>

      {/* Tabla con Paginación */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{viewMode === 'MATRIZ' ? 'Diseño' : 'Categoría'}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Identificador</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filasPaginadas.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">No se encontraron resultados</td></tr>
            ) : (
              filasPaginadas.map((fila) => (
                <tr key={fila.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {fila.imagen ? <img src={fila.imagen} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-gray-300" /></div>}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{fila.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-xs  font-mono ${fila.codigo === 'STOCK GLOBAL' ? 'text-violet-500 italic' : 'text-gray-400'}`}>{fila.codigo || '—'}</span>
                      {fila.codigo && fila.codigo !== 'STOCK GLOBAL' && (
                        <button onClick={() => handleCopy(fila.codigo!, fila.id)} className="text-gray-300 hover:text-blue-500 transition-colors">
                          {copiedId === fila.id ? <Check size={12} className="text-green-700" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-sm">{fila.inv?.cantidad || 0}</td>
                  <td className="px-4 py-3 text-center">
                    {!fila.inv || fila.inv.cantidad === 0 ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium uppercase">Sin stock</span> : fila.inv.cantidad <= (fila.inv.stock_minimo || 0) ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold uppercase inline-flex items-center gap-1"><AlertTriangle size={10} /> Bajo</span> : <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold uppercase">OK</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button disabled={viewMode === 'LOCALES' && !fila.inv} onClick={() => handleOpenModal(fila)} className={`px-3 py-1.5 text-xs text-white rounded-lg transition-colors ml-auto flex items-center gap-1 ${viewMode === 'MATRIZ' ? 'bg-blue-600 hover:bg-blue-700' : (!fila.inv ? 'bg-gray-100 text-gray-400! cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-600')}`}>
                      {viewMode === 'LOCALES' && !fila.inv ? <Clock size={12} /> : <Plus size={12} />}
                      {viewMode === 'LOCALES' && !fila.inv ? 'Sin Registro' : fila.inv ? 'Movimiento' : 'Añadir'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Paginación Estilo Elitex */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
            <div className="text-[10px] font-mediun text-gray-400 ">
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




      <StockModal
        isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchData}
        inventario={selectedInventario} disenoId={selectedDiseno?.id || 0}
        disenoNombre={selectedDiseno?.nombre || ''} sucursalId={selectedSucursalId}
        sucursalNombre={sucursales.find(s => s.id === selectedSucursalId)?.nombre || ''}
         sucursales={allSucursales} disenoNodoId={selectedDiseno?.nodo_id || 0} viewMode={viewMode}
      />
    </div>
  )
}

export default Inventario;