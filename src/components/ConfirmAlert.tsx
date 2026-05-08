import { useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => Promise<void> | void // Soportamos funciones asíncronas
  onCancel: () => void
  confirmText?: string
  type?: 'danger' | 'warning'
}

const ConfirmAlert = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmar', 
  type = 'danger' 
}: Props) => {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      await onConfirm()
    } catch (error) {
      console.error("Error en la confirmación:", error)
    } finally {
      // Solo volvemos a false si el modal no se cerró (por si hay un error)
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button 
            onClick={onCancel} 
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all active:scale-95 shadow-lg ${
              isProcessing ? 'opacity-80 cursor-not-allowed' : ''
            } ${
              type === 'danger' 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-100' 
                : 'bg-amber-500 hover:bg-amber-600 shadow-amber-100'
            }`}
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {isProcessing ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmAlert