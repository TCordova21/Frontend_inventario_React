import { useState, useEffect } from 'react'
import { X, ImageOff } from 'lucide-react'
import { createDisenoColor } from '../../api/disenoColor.api'
import { getDisenos } from '../../api/disenos.api'
import { getColores } from '../../api/colores.api'
import type { CreateDisenoColorDto } from '../../types/disenoColor.types'
import type { Diseno } from '../../types/diseno.types'
import type { Color } from '../../types/color.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subcategoriaId: number  // para filtrar diseños de esta subcategoría
}

const EMPTY: CreateDisenoColorDto = {
  diseno_id: 0,
  color_id: 0,
  precio: 0,
  sku: '',
}

const CreateDisenoColorModal = ({ isOpen, onClose, onSuccess, subcategoriaId }: Props) => {
  const [form, setForm] = useState<CreateDisenoColorDto>(EMPTY)
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [colores, setColores] = useState<Color[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Diseño seleccionado para preview
  const selectedDiseno = disenos.find((d) => d.id === Number(form.diseno_id))
  const selectedColor = colores.find((c) => c.id === Number(form.color_id))

  useEffect(() => {
    if (!isOpen) return
    Promise.all([getDisenos(), getColores()]).then(([d, c]) => {
      // Filtrar diseños de esta subcategoría
      setDisenos(d.filter((dis) => dis.subcategoria_id === subcategoriaId))
      setColores(Array.isArray(c) ? c : [])
    })
  }, [isOpen, subcategoriaId])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.diseno_id)     return setError('Selecciona un diseño')
    if (!form.color_id)      return setError('Selecciona un color')
    if (!form.precio)        return setError('Ingresa el precio')
    if (!form.sku.trim())    return setError('Ingresa el SKU')
    try {
      setLoading(true)
      await createDisenoColor({
        diseno_id:  Number(form.diseno_id),
        color_id:   Number(form.color_id),
        precio:     Number(form.precio),
        sku:        form.sku,
      })
      setForm(EMPTY)
      onSuccess()
      onClose()
    } catch {
      setError('Error al crear. Puede que esta combinación ya exista.')
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
        className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Nueva variante</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Preview combinación */}
          <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 flex items-center justify-center">
              {selectedDiseno?.imagen ? (
                <img
                  src={selectedDiseno.imagen}
                  alt={selectedDiseno.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageOff size={20} className="text-gray-300" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-1.5">
              <p className="text-sm font-medium text-gray-700">
                {selectedDiseno ? selectedDiseno.nombre : 'Selecciona un diseño'}
              </p>
              <div className="flex items-center gap-2">
                {selectedColor ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200 shrink-0"
                      style={{ backgroundColor: selectedColor.codigo_hex }}
                    />
                    <span className="text-xs text-gray-500">{selectedColor.nombre}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Selecciona un color</span>
                )}
              </div>
            </div>
          </div>

          {/* Diseño */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Diseño <span className="text-red-500">*</span>
            </label>
            <select
              name="diseno_id"
              value={form.diseno_id}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value={0} disabled>Selecciona un diseño</option>
              {disenos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre} — {d.codigo}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Color <span className="text-red-500">*</span>
            </label>
            <select
              name="color_id"
              value={form.color_id}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value={0} disabled>Selecciona un color</option>
              {colores.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.codigo_hex}</option>
              ))}
            </select>
          </div>

          {/* Precio y SKU en fila */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Precio <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  name="precio"
                  value={form.precio || ''}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU-001"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
              {loading ? 'Guardando...' : 'Crear variante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateDisenoColorModal