import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
   Printer, RotateCcw, ChevronRight, 
  CheckCircle2, Calendar, Store, User, 
  TrendingDown, ShoppingCart, XCircle, Clock
} from 'lucide-react'
import { getVentaById, procesarDevolucion } from '../../api/venta.api'
import type { VentaDetalle } from '../../types/venta.types'
import LoadingScreen from '../../components/LoadingScreen'
import DevolucionModal from '../../components/modals/DevolucionModal'
import { toast } from 'react-toastify'
import { getImageUrl } from '../../utils/image'

const DetalleVenta = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [venta, setVenta] = useState<VentaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemsADevolver, setItemsADevolver] = useState<{[key: number]: number}>({})
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true)
      if (!id) return
      const data = await getVentaById(Number(id))
      setVenta(data)
      
      const initialQuantities: {[key: number]: number} = {}
      data.detalle_ventas.forEach(d => { initialQuantities[d.id] = 0 })
      setItemsADevolver(initialQuantities)
    } catch (error) {
      toast.error("No se pudo cargar el detalle")
      navigate('/ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id])

  const handleInputChange = (detalleId: number, val: string, max: number) => {
    const num = Math.max(0, Math.min(max, Number(val)));
    setItemsADevolver(prev => ({ ...prev, [detalleId]: num }));
  }

  const submitDevolucion = async () => {
    const items = Object.entries(itemsADevolver)
      .filter(([_, cantidad]) => cantidad > 0)
      .map(([id, cantidad]) => ({ detalle_venta_id: Number(id), cantidad }));

    try {
      setIsSaving(true);
      if (!id) return
      await procesarDevolucion(Number(id), items)
      toast.success("Devolución procesada")
      setIsModalOpen(false)
      fetchData() 
    } catch (error) {
      toast.error("Error al procesar")
    } finally {
    setIsSaving(false); // 3. Desactivar carga
  }
    
  }

  if (loading) return <LoadingScreen />
  if (!venta) return null

  // Métricas calculadas al estilo Inventario
  const metrics = {
    totalItems: venta.detalle_ventas.length,
    unidadesVendidas: venta.detalle_ventas.reduce((acc, d) => acc + d.cantidad, 0),
    unidadesDevueltas: venta.detalle_ventas.reduce((acc, d) => acc + (d.cantidad_devuelta || 0), 0),
    totalVenta: Number(venta.total).toFixed(2)
  }

  const sePuedeDevolver = venta.estado === 'COMPLETADA' || venta.estado === 'PARCIALMENTE_DEVUELTA'

  return (
    <div className="p-6 animate-in fade-in duration-500">
      
      {/* Breadcrumbs estilo Movimientos */}
      <nav className="flex items-center gap-2 text-sm whitespace-nowrap  text-gray-400 mb-4">
        <Link to="/ventas" className="hover:text-blue-600">Ventas</Link>
        <ChevronRight size={12} />
        <span className="hover:text-blue-600 transition-colors flex items-center gap-1 shrink-0">Detalle #{venta.id}</span>
      </nav>

      {/* Header estilo Movimientos */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
       
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Orden de Venta</h1>
            <p className="text-[10px] text-gray-400 mt-0.5">ID Transacción: {venta.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sePuedeDevolver && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium  hover:bg-amber-600 transition-all"
            >
              <RotateCcw size={14} /> Devolución
            </button>
          )}
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all "
          >
            <Printer size={14} /> Imprimir
          </button>
        </div>
      </div>

      {/* Métricas estilo Inventario */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total Diseños</p>
          <p className="text-2xl font-semibold text-gray-800">{metrics.totalItems}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Unidades Vendidas</p>
          <p className="text-2xl font-semibold text-blue-600">{metrics.unidadesVendidas}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1 text-amber-500">
            <TrendingDown size={12} />
            <p className="text-xs text-gray-400">Devoluciones</p>
          </div>
          <p className="text-2xl font-semibold text-amber-500">{metrics.unidadesDevueltas}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1 text-green-500">
            <ShoppingCart size={12} />
            <p className="text-xs text-gray-400">Total Venta</p>
          </div>
          <p className="text-2xl font-semibold text-gray-800">${metrics.totalVenta}</p>
        </div>
      </div>

      {/* Info de la Venta (Vendedor, Sucursal, Fecha) */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <User size={12} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] font-medium text-blue-400 uppercase tracking-tighter">Vendedor</span>
            <span className="text-xs font-semibold text-blue-700 uppercase">{venta.usuarios?.nombre}</span>
          </div>
        </div>

        <div className="flex items-center font-medium gap-2 px-4 py-1.5 bg-gray-50 border border-gray-300 rounded-full text-gray-500">
          <Store size={16} />
          <span className="text-xs ">{venta.sucursales?.nombre}</span>
        </div>

        <div className="flex items-center font-medium gap-2 px-4 py-1.5 bg-gray-50 border border-gray-300 rounded-full text-gray-500">
          <Calendar size={16} />
          <span className="text-xs ">{new Date(venta.fecha).toLocaleDateString('es-EC')}</span>
        </div>
      </div>

      {/* Tabla estilo Movimientos */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Producto / Detalle</th>
              <th className="px-4 py-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">Vendidos</th>
              <th className="px-4 py-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">Devueltos</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-400 uppercase tracking-wider">P. Unitario</th>
              <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-400 uppercase tracking-wider">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {venta.detalle_ventas.map((detalle) => (
              <tr key={detalle.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                      <img
                        src={getImageUrl(detalle.disenos?.imagen || detalle.nodos?.imagen)}
                        className="w-full h-full object-cover"
                        alt="prod"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-700 font-medium">{detalle.disenos?.nombre || detalle.nodos?.nombre}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase">
                        {detalle.diseno_id ? 'Personalizado' : 'Stock Global'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm font-bold text-gray-800">{detalle.cantidad}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {detalle.cantidad_devuelta ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600 uppercase">
                      <RotateCcw size={10} /> {detalle.cantidad_devuelta}
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-300 font-medium uppercase">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs text-gray-500 font-medium">
                  ${Number(detalle.precio_unitario).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm font-bold text-gray-900">
                    ${(Number(detalle.cantidad) * Number(detalle.precio_unitario)).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer de Tabla para Estados estilo Movimientos */}
          <tfoot className="bg-gray-50/50">
            <tr>
              <td colSpan={5} className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                   <span className="text-[10px] font-medium text-gray-400 uppercase">Estado Venta:</span>
                   {venta.estado === 'COMPLETADA' && (
                     <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase">
                        <CheckCircle2 size={12} /> Completada
                     </span>
                   )}
                   {venta.estado === 'CANCELADA' && (
                     <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase">
                        <XCircle size={12} /> Cancelada
                     </span>
                   )}
                   {venta.estado === 'PARCIALMENTE_DEVUELTA' && (
                     <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase">
                        <Clock size={12} /> Parcial
                     </span>
                   )}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <DevolucionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={submitDevolucion}
        venta={venta}
        itemsADevolver={itemsADevolver}
        onInputChange={handleInputChange}
        saving={isSaving}
      />
    </div>
  )
}

export default DetalleVenta