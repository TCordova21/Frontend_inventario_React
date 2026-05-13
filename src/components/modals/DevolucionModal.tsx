import { X, RotateCcw, Package, AlertCircle } from 'lucide-react'
import type { VentaDetalle } from '../../types/venta.types'

interface DevolucionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  venta: VentaDetalle
  itemsADevolver: { [key: number]: number }
  onInputChange: (detalleId: number, val: string, max: number) => void
  saving?: boolean
}

const DevolucionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  venta, 
  itemsADevolver, 
  onInputChange,
  saving = false
}: DevolucionModalProps) => {
  if (!isOpen) return null

  const hasSelection = Object.values(itemsADevolver).some(qty => qty > 0);
const isBtnDisabled = saving || !hasSelection;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-lg w-full max-w-130 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header al estilo StockModal */}
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <RotateCcw size={18} className="text-amber-500" />
              Procesar Devolución
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Venta: <span className="font-medium text-blue-600 uppercase">#{venta.id}</span> | 
            Fecha: <span className="font-medium text-gray-600">{new Date(venta.fecha).toLocaleDateString()}</span>
          </p>

        </div>

        {/* Contenido / Listado de Productos */}
        <div className="px-6 pb-4 space-y-3 max-h-[40vh] overflow-y-auto">
          {venta.detalle_ventas.map((detalle) => {
            const disponible = detalle.cantidad - (detalle.cantidad_devuelta || 0)
            if (disponible <= 0) return null;

            return (
              <div key={detalle.id} className="group flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-white hover:border-amber-200 transition-all">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-bold text-gray-700 truncate">
                    {detalle.disenos?.nombre || detalle.nodos?.nombre || 'Producto'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Package size={12} className="text-gray-400" />
                    <span className="text-[10px] text-gray-500 font-medium">
                      Disponible: <b className="text-gray-700">{disponible} uds.</b>
                    </span>
                  </div>
                </div>
                
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    max={disponible}
                    value={itemsADevolver[detalle.id] || ''}
                    placeholder="0"
                    onChange={(e) => onInputChange(detalle.id, e.target.value, disponible)}
                    disabled={saving} //
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-center font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white transition-all"
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 bg-white">
          <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 mb-4">
            <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700 leading-tight">
              Las cantidades ingresadas serán reintegradas al stock de la sucursal origen de la venta.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={saving} //
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isBtnDisabled}
              className="px-4 py-2 text-sm text-white rounded-lg shadow-sm disabled:opacity-50 transition-all bg-amber-600 hover:bg-amber-700 flex items-center gap-2 font-medium"
            >
              {saving ? 'Procesando...' : 'Confirmar Devolución'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevolucionModal