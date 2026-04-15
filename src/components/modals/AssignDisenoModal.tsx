import { useState } from 'react'
import { X, ImageOff } from 'lucide-react'
import { assignDisenoToCliente } from '../../api/cliente.api'
import type { Diseno } from '../../types/diseno.types'
import type { ClienteDiseno } from '../../types/cliente.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clienteId: number
  disenos: Diseno[]
  disenosAsignados: ClienteDiseno[]
}

const AssignDisenoModal = ({
  isOpen,
  onClose,
  onSuccess,
  clienteId,
  disenos,
  disenosAsignados
}: Props) => {

  const [disenoId, setDisenoId] = useState<number>(0)
  const [exclusivo, setExclusivo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  if (!isOpen) return null

  // ❗ filtrar diseños ya asignados
  const disponibles = disenos.filter(
    d => !disenosAsignados.some(a => a.diseno_id === d.id)
  )

  const selected = disponibles.find(d => d.id === disenoId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!disenoId) return setError('Selecciona un diseño')

    try {
      setLoading(true)

      await assignDisenoToCliente({
        diseno_id: disenoId,
        cliente_id: clienteId,
        exclusivo
      })

      setDisenoId(0)
      setExclusivo(false)

      onSuccess()
    } catch {
      setError('Error al asignar diseño')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Asignar diseño
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview */}
          <div className="w-full h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {selected?.imagen && !imgError ? (
              <img
                src={selected.imagen}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-300">
                <ImageOff size={32} />
                <span className="text-xs">Vista previa</span>
              </div>
            )}
          </div>

          {/* Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Diseño <span className="text-red-500">*</span>
            </label>

            <select
              value={disenoId}
              onChange={(e) => {
                setDisenoId(Number(e.target.value))
                setError(null)
                setImgError(false)
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value={0}>Seleccionar diseño</option>

              {disponibles.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre} ({d.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Exclusivo */}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={exclusivo}
              onChange={(e) => setExclusivo(e.target.checked)}
              className="rounded border-gray-300"
            />
            Diseño exclusivo para este cliente
          </label>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Asignar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default AssignDisenoModal