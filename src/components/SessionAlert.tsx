import { useState } from 'react'
import { Loader2, Clock } from 'lucide-react'

interface Props {
  isOpen: boolean
  secondsLeft: number
  onExtend: () => Promise<void> | void
  onLogout: () => void
}

const SessionAlert = ({
  isOpen,
  secondsLeft,
  onExtend,
  onLogout
}: Props) => {

  const [loading, setLoading] = useState(false)

  if (!isOpen) return null
const handleExtend = async () => {
  try {

  

    setLoading(true)

    await onExtend()

  

  } catch (error) {



  } finally {

  

    setLoading(false)
  }
}
  // ✅ Formato MM:SS
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  const formattedTime = `${minutes}:${seconds
    .toString()
    .padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999 p-4 animate-in fade-in duration-200">

      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">

        <div className="p-6">

          <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center bg-amber-50 text-amber-500">
            <Clock size={24} />
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Sesión próxima a expirar
          </h3>

          <p className="text-sm text-gray-500 leading-relaxed">
            Tu sesión expirará en:
          </p>

          {/* CONTADOR */}
          <div className="mt-4 flex items-center justify-center">
            <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-3xl font-bold tracking-wider text-amber-600 font-mono">
                {formattedTime}
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            ¿Deseas extender tu sesión?
          </p>

        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">

          <button
            onClick={onLogout}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cerrar sesión
          </button>

          <button
            onClick={handleExtend}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all active:scale-95 shadow-lg bg-amber-500 hover:bg-amber-600 shadow-amber-100 ${
              loading ? 'opacity-80 cursor-not-allowed' : ''
            }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Extendiendo...' : 'Extender sesión'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default SessionAlert