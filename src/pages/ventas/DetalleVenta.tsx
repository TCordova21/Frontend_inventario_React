import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Printer, 
  Package, ShoppingCart, CheckCircle2, XCircle,
  Hash, Info, RotateCcw, AlertTriangle
} from 'lucide-react'
import { getVentaById, updateEstadoVenta } from '../../api/venta.api' // Asumiendo que existe updateEstadoVenta
import type { VentaDetalle } from '../../types/venta.types'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmAlert from '../../components/ConfirmAlert'
import { toast } from 'react-toastify'

const DetalleVenta = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [venta, setVenta] = useState<VentaDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const fetchVenta = async () => {
    try {
      setLoading(true)
      if (!id) return
      const data = await getVentaById(Number(id))
      setVenta(data)
    } catch (error) {
      toast.error("No se pudo cargar el detalle de la venta")
      navigate('/ventas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVenta()
  }, [id, navigate])

  const handleDevolucion = async () => {
    try {
      if (!id) return
      // Esta función debe llamar al endpoint que cambia el estado a 'DEVUELTA'
      // y dispara en el backend el trigger para reponer stock
      await updateEstadoVenta(Number(id), 'DEVUELTA')
      toast.success("Venta devuelta y stock repuesto correctamente")
      fetchVenta() // Recargamos para ver el nuevo estado
    } catch (error) {
      toast.error("Error al procesar la devolución")
    } finally {
      setConfirmOpen(false)
    }
  }

  if (loading) return <LoadingScreen />
  if (!venta) return null

  const esCancelada = venta.estado === 'CANCELADA'
  const esDevuelta = venta.estado === 'DEVUELTA'
  const sePuedeDevolver = venta.estado === 'COMPLETADA'

  return (
    <div className="p-6 animate-in fade-in duration-500">
      {/* Header Estilo Inventario */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/ventas')}
            className="p-2 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors text-gray-500 border border-gray-200 hover:border-blue-300"
          >
            <ArrowLeft size={20} strokeWidth={3} className='hover:text-blue-600' />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-blue-600" size={24} />
              Venta # {venta.id}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {sePuedeDevolver && (
            <button 
              onClick={() => setConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-100 transition-all shadow-sm active:scale-95"
            >
              <RotateCcw size={14} strokeWidth={3} /> Procesar Devolución
            </button>
          )}
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Printer size={14} /> Imprimir Comprobante
          </button>
        </div>
      </div>

      {/* Métricas de la Venta */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado</p>
          {esCancelada && (
            <span className="text-sm font-semibold text-red-500 flex items-center gap-1">
              <XCircle size={14} /> ANULADA
            </span>
          )}
          {esDevuelta && (
            <span className="text-sm font-semibold text-amber-500 flex items-center gap-1">
              <RotateCcw size={14} /> DEVUELTA
            </span>
          )}
          {venta.estado === 'COMPLETADA' && (
            <span className="text-sm font-semibold text-green-500 flex items-center gap-1">
              <CheckCircle2 size={14} /> COMPLETADA
            </span>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha de Venta</p>
          <p className="text-sm font-semibold text-gray-700">{new Date(venta.fecha).toLocaleDateString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sucursal</p>
          <p className="text-sm font-semibold text-gray-700">{venta.sucursales?.nombre}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Cobrado</p>
          <p className="text-xl font-bold text-gray-800">${Number(venta.total).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${esDevuelta ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Package size={14} /> Artículos en Comprobante
              </h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Diseño / Producto</th>
                  <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cant.</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">P. Unit</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {venta.detalle_ventas.map((detalle, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                          {(detalle.disenos as any)?.imagen ? (
                            <img src={(detalle.disenos as any).imagen} className="w-full h-full object-cover" alt="prod" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {detalle.disenos?.nombre || detalle.nodos?.nombre || 'Producto'}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {detalle.disenos?.codigo || 'STOCK_GLOBAL'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                      {detalle.cantidad}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      ${Number(detalle.precio_unitario).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                      ${(Number(detalle.cantidad) * Number(detalle.precio_unitario)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {esDevuelta && (
              <div className="bg-amber-50 p-4 border-t border-amber-100 flex items-center justify-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-tight">Venta Devuelta: El stock de estos artículos ha sido retornado al inventario.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Lateral */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={14} className="text-blue-500" /> Detalle Administrativo
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-400">Vendedor:</span>
                <span className="text-xs font-semibold text-gray-700">{venta.usuarios?.nombre || 'Administrador'}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-400">ID Interno:</span>
                <span className="text-xs font-mono text-blue-600">TX-00{venta.id}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Subtotal 0%</span>
                  <span className="text-sm font-medium text-gray-700">${Number(venta.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-500">IVA 0%</span>
                  <span className="text-sm font-medium text-gray-700">$0.00</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Total Final</span>
                    <span className={`text-xl font-bold ${esDevuelta ? 'text-amber-600' : 'text-gray-900'}`}>
                      ${Number(venta.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4">
            <p className="text-[10px] font-bold text-blue-600 uppercase mb-2 flex items-center gap-2">
              <Hash size={12} /> Referencia Digital
            </p>
            <p className="text-[10px] font-mono text-blue-400 break-all leading-relaxed">
              ELITEX-INV-{venta.id}-{new Date(venta.fecha).getTime()}
            </p>
          </div>
        </div>
      </div>

      <ConfirmAlert 
        isOpen={confirmOpen}
        title="¿Procesar Devolución?"
        message="Se cambiará el estado a DEVUELTA y los artículos volverán al inventario. Esta acción no se puede deshacer."
        onConfirm={handleDevolucion}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default DetalleVenta