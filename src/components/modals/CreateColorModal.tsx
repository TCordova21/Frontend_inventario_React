import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createColor, updateColor } from '../../api/colores.api' // Asumiendo que existe updateColor
import type { Color, CreateColorDto } from '../../types/color.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  colorToEdit?: Color | null // Nueva prop para edición
}

const CreateColorModal = ({ isOpen, onClose, onSuccess, colorToEdit }: Props) => {
  const [form, setForm] = useState<CreateColorDto>({ nombre: '', codigo_hex: '#000000' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sincronizar el formulario con el color a editar o resetear
  useEffect(() => {
    if (isOpen) {
      if (colorToEdit) {
        setForm({
          nombre: colorToEdit.nombre,
          codigo_hex: colorToEdit.codigo_hex
        })
      } else {
        setForm({ nombre: '', codigo_hex: '#000000' })
      }
      setError(null)
    }
  }, [isOpen, colorToEdit])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    
    try {
      setLoading(true)
      if (colorToEdit) {
        // Lógica de actualización
        await updateColor(colorToEdit.id, form)
      } else {
        // Lógica de creación
        await createColor(form)
      }
      
      onSuccess()
      onClose()
    } catch (err) {
      setError(colorToEdit ? 'Error al actualizar el color' : 'Error al crear el color')
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
        className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            {colorToEdit ? 'Editar color' : 'Nuevo color'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview del color */}
          <div
            className="w-full h-20 rounded-lg border border-gray-200 transition-all"
            style={{ backgroundColor: form.codigo_hex }}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => { setForm({ ...form, nombre: e.target.value }); setError(null) }}
              placeholder="Ej: Azul cielo"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={form.codigo_hex}
                onChange={(e) => setForm({ ...form, codigo_hex: e.target.value })}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={form.codigo_hex}
                onChange={(e) => setForm({ ...form, codigo_hex: e.target.value })}
                placeholder="#000000"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
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
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : (colorToEdit ? 'Guardar cambios' : 'Crear color')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateColorModal