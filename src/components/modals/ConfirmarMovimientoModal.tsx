import { useState, useEffect } from 'react'
import { X, Package, CheckCircle2, Edit3, AlertTriangle } from 'lucide-react'
import type { Movimiento } from '../../types/movimiento.types'
import { useAuth } from '../../context/AuthContext' // Asumiendo que usas un hook de auth

interface Props {
  isOpen: boolean
  onClose: () => void
  // Actualizamos la firma de onConfirm para incluir el nuevo campo
  onConfirm: (id: number, data: { 
    cantidad_confirmada: number; 
    fecha_confirmacion: string;
    usuario_confirmacion_id: number; // Nuevo campo
  }) => Promise<void>
  movimiento: Movimiento | null
}

const ConfirmarMovimientoModal = ({ isOpen, onClose, onConfirm, movimiento }: Props) => {
  const { usuario } = useAuth() // Obtenemos el usuario logueado
  const [cantidadRecibida, setCantidadRecibida] = useState<number>(0)
  const [esCantidadCorrecta, setEsCantidadCorrecta] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen && movimiento) {
      setCantidadRecibida(movimiento.cantidad)
      setEsCantidadCorrecta(true)
    }
  }, [isOpen, movimiento])

  if (!isOpen || !movimiento) return null

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()

    const valorFinal = Number(cantidadRecibida)

    if (valorFinal > movimiento.cantidad) {
      alert(`La cantidad recibida no puede ser mayor a la enviada`);
      return;
    }

    // Validación de seguridad por si el usuario no está cargado
    if (!usuario?.id) {
      alert("Error: No se pudo identificar al usuario que confirma.");
      return;
    }

    try {
      setSaving(true)

      const dataParaEnviar = {
        cantidad_confirmada: valorFinal,
        fecha_confirmacion: new Date().toISOString(),
        usuario_confirmacion_id: usuario.id // Enviamos el ID del usuario actual
      };

      console.log("🚀 Enviando confirmación con responsable:", dataParaEnviar);

      await onConfirm(movimiento.id, dataParaEnviar)
      
      onClose()
    } catch (error) {
      console.error("❌ Error en la petición:", error);
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-800">Confirmar Recepción</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Ref: <span className="font-medium text-blue-600 uppercase">{movimiento.referencia}</span> | 
          Ítem: <span className="font-medium text-gray-600">{movimiento.disenos?.nombre || movimiento.nodos?.nombre}</span>
        </p>

        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          
          {/* Info del Envío */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Package size={16} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Cantidad enviada</p>
              <p className="text-sm font-semibold text-gray-800">{movimiento.cantidad} unidades</p>
            </div>
          </div>

          {/* Toggle de Verificación */}
          <div className="flex items-center justify-between py-1">
            <label className="text-sm font-medium text-gray-700">¿Recibió la cantidad exacta?</label>
            <button 
              type="button"
              onClick={() => {
                const nuevoEstado = !esCantidadCorrecta;
                setEsCantidadCorrecta(nuevoEstado);
                if (nuevoEstado) {
                  setCantidadRecibida(movimiento.cantidad);
                }
              }}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                esCantidadCorrecta ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                esCantidadCorrecta ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Input de Cantidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Cantidad recibida <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={cantidadRecibida}
                disabled={esCantidadCorrecta}
                onChange={(e) => setCantidadRecibida(Number(e.target.value))}
                min="0"
                max={movimiento.cantidad}
                className={`w-full px-3 py-2 pl-10 rounded-lg border text-sm transition-all outline-none ${
                  esCantidadCorrecta 
                    ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-white border-blue-500 text-blue-600 ring-2 ring-blue-50'
                }`}
              />
              {esCantidadCorrecta ? (
                <CheckCircle2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              ) : (
                <Edit3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
              )}
            </div>
            {!esCantidadCorrecta && cantidadRecibida < movimiento.cantidad && (
              <p className="text-[10px] text-orange-600 font-medium">
                Se registrará una diferencia de {movimiento.cantidad - cantidadRecibida} unidades como pérdida.
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="flex gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
            <AlertTriangle className="text-red-500 shrink-0" size={16} />
            <p className="text-[11px] text-red-700 leading-tight font-medium">
              Esta acción es irreversible. El stock del local se incrementará únicamente por la cantidad recibida.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || cantidadRecibida < 0 || cantidadRecibida > movimiento.cantidad}
              className="px-4 py-2 text-sm font-semibold text-white bg-gray-800 hover:bg-black rounded-lg disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? 'Procesando...' : 'Confirmar Recepción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConfirmarMovimientoModal