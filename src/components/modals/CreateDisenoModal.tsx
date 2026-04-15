import { useState, useEffect } from 'react'
import { X, ImageOff } from 'lucide-react'
import { createDiseno } from '../../api/disenos.api'
import { getSubcategorias } from '../../api/disenos.api'
import type { CreateDisenoDto, Diseno, Subcategoria } from '../../types/diseno.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (diseno: Diseno) => void  // ← ahora devuelve el diseño
  subcategoriaId?: number              // ← preselecciona la subcategoría
}


const EMPTY_FORM: CreateDisenoDto = {
  nombre: '',
  imagen: '',
  descripcion: '',
  codigo: '',
  subcategoria_id: 0,
}

const CreateDisenoModal = ({ isOpen, onClose, onSuccess, subcategoriaId }: Props) => {
  const [form, setForm] = useState<CreateDisenoDto>(EMPTY_FORM)
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
  if (subcategoriaId) {
    setForm((prev) => ({ ...prev, subcategoria_id: subcategoriaId }))
  }
}, [subcategoriaId, isOpen])


  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
    if (e.target.name === 'imagen') setImgError(false)
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!form.nombre?.trim()) return setError('El nombre es obligatorio')
  if (!form.codigo?.trim()) return setError('El código es obligatorio')
  if (!form.subcategoria_id) return setError('Selecciona una subcategoría')
  try {
    setLoading(true)
    const disenoCreado = await createDiseno({
      ...form,
      subcategoria_id: Number(form.subcategoria_id),
    })
    setForm(EMPTY_FORM)
    onSuccess(disenoCreado)  // ← pasa el objeto completo
  } catch {
    setError('Error al crear el diseño')
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
          <h2 className="text-lg font-semibold text-gray-800">Nuevo diseño</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview imagen */}
          <div className="w-full h-40 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
            {form.imagen && !imgError ? (
              <img
                src={form.imagen}
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

          {/* Nombre */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Vegeta"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Código */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ej: DRA-VEG-001"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* URL Imagen */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">URL de imagen (Pinterest)</label>
            <input
              name="imagen"
              value={form.imagen}
              onChange={handleChange}
              placeholder="https://i.pinimg.com/..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Diseño de Vegeta Super Saiyan"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
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
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Crear diseño'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateDisenoModal