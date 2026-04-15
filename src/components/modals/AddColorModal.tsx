import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { getColores } from '../../api/colores.api'
import { createDisenoColor } from '../../api/disenoColor.api'
import type { Color } from '../../types/color.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  disenoId: number
  coloresAsignados: number[]  // ids ya asignados para no mostrarlos
}

const AddColorModal = ({ isOpen, onClose, onSuccess, disenoId, coloresAsignados }: Props) => {
  const [colores, setColores] = useState<Color[]>([])
  const [selectedId, setSelectedId] = useState<number>(0)
  const [descripcion, setDescripcion] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    getColores().then((data) => {
      // Filtrar los ya asignados
      setColores(data.filter((c) => !coloresAsignados.includes(c.id)))
    })
    setSelectedId(0)
    setDescripcion('')
    setError(null)
  }, [isOpen, coloresAsignados])

  if (!isOpen) return null

  const selectedColor = colores.find((c) => c.id === selectedId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return setError('Selecciona un color')
    try {
      setSaving(true)
      await createDisenoColor({ diseno_id: disenoId, color_id: selectedId, descripcion })
      onSuccess()
      onClose()
    } catch {
      setError('Error al añadir el color. Puede que ya esté asignado.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Añadir color</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview color seleccionado */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 min-h-12">
            {selectedColor ? (
              <>
                <span
                  className="w-8 h-8 rounded-full border border-gray-200 shrink-0"
                  style={{ backgroundColor: selectedColor.codigo_hex }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{selectedColor.nombre}</p>
                  <p className="text-xs font-mono text-gray-400">{selectedColor.codigo_hex}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">Selecciona un color para previsualizar</p>
            )}
          </div>

          {/* Selector de colores como grid visual */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Color <span className="text-red-500">*</span>
            </label>
            {colores.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                Todos los colores ya están asignados a este diseño
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                {colores.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => { setSelectedId(color.id); setError(null) }}
                    title={color.nombre}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedId === color.id
                        ? 'border-blue-500 scale-110 shadow-md'
                        : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.codigo_hex }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Descripción opcional */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Descripción (opcional)</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Variante especial edición limitada"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
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
              disabled={saving || colores.length === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Añadir color'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddColorModal