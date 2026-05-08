import { AlertTriangle } from 'lucide-react'

interface Props {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
}

const WarningAlert = ({ isOpen, title, message, onClose }: Props) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200 border border-amber-100">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-amber-50 text-amber-500">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-100"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}

export default WarningAlert 