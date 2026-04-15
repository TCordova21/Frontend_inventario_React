import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createMovimiento } from '../../api/movimiento.api'
import { getDisenos } from '../../api/disenos.api'
import type { Diseno } from '../../types/diseno.types'
import type { CreateMovimientoDto } from '../../types/movimiento.types'
import type { Sucursal } from '../../types/inventario.types'

const TIPOS = ['TRASLADO',  'AJUSTE', 'ENTRADA', 'DEVOLUCION']
const MATRIZ_ID = 1

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sucursales: Sucursal[]
}

const EMPTY: CreateMovimientoDto = {
  diseno_id: 0,
  sucursal_origen_id: MATRIZ_ID,
  sucursal_destino_id: undefined,
  tipo_movimiento: 'TRASLADO',
  cantidad: 0,
  referencia: '',
  observacion: '',
}

const CreateMovimientoModal = ({ isOpen, onClose, onSuccess, sucursales }: Props) => {
  const [form, setForm] = useState<CreateMovimientoDto>(EMPTY)
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    getDisenos().then(setDisenos).catch(() => setDisenos([]))
    setForm(EMPTY)
    setError(null)
  }, [isOpen])

  if (!isOpen) return null

  const requiereDestino = form.tipo_movimiento === 'TRASLADO'
  const selectedDiseno = disenos.find((d) => d.id === Number(form.diseno_id))

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.diseno_id)          return setError('Selecciona un diseño')
    if (!form.tipo_movimiento)    return setError('Selecciona el tipo de movimiento')
    if (!form.cantidad || Number(form.cantidad) <= 0) return setError('La cantidad debe ser mayor a 0')
    if (!form.referencia.trim())  return setError('La referencia es obligatoria')
    if (requiereDestino && !form.sucursal_destino_id) return setError('Selecciona la sucursal destino')

    try {
      setSaving(true)
      await createMovimiento({
        ...form,
        diseno_id: Number(form.diseno_id),
        sucursal_origen_id: Number(form.sucursal_origen_id),
        sucursal_destino_id: form.sucursal_destino_id ? Number(form.sucursal_destino_id) : undefined,
        cantidad: Number(form.cantidad),
      })
      onSuccess()
      onClose()
    } catch {
      setError('Error al registrar el movimiento')
    } finally {
      setSaving(false)
    }
  }

  const colorTipo: Record<string, string> = {
    TRASLADO:   'bg-blue-100 text-blue-700',
    AJUSTE:     'bg-amber-100 text-amber-700',
    ENTRADA:    'bg-purple-100 text-purple-700',
    DEVOLUCION: 'bg-red-100 text-red-700',
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
          <h2 className="text-lg font-semibold text-gray-800">Nuevo movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Tipo de movimiento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tipo de movimiento <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => { setForm({ ...form, tipo_movimiento: tipo }); setError(null) }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.tipo_movimiento === tipo
                      ? `${colorTipo[tipo]} border-transparent`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {tipo}
                </button>
              ))}
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
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
            >
              <option value={0} disabled>Selecciona un diseño</option>
              {disenos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre} — {d.codigo}</option>
              ))}
            </select>
            {/* Preview diseño seleccionado */}
            {selectedDiseno?.imagen && (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={selectedDiseno.imagen}
                  alt={selectedDiseno.nombre}
                  className="w-8 h-8 rounded-md object-cover border border-gray-200"
                />
                <span className="text-xs text-gray-500">{selectedDiseno.descripcion}</span>
              </div>
            )}
          </div>

          {/* Sucursales */}
          <div className={`grid gap-3 ${requiereDestino ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Sucursal origen</label>
              <select
                name="sucursal_origen_id"
                value={form.sucursal_origen_id}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
              >
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>

            {requiereDestino && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Sucursal destino <span className="text-red-500">*</span>
                </label>
                <select
                  name="sucursal_destino_id"
                  value={form.sucursal_destino_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
                >
                  <option value="" disabled>Selecciona destino</option>
                  {sucursales.filter((s) => s.id !== Number(form.sucursal_origen_id)).map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cantidad"
              value={form.cantidad || ''}
              onChange={handleChange}
              min="1"
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Referencia */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Referencia <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="referencia"
              value={form.referencia}
              onChange={handleChange}
              placeholder="Ej: Venta mostrador, Traslado semanal..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Observación */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Observación (opcional)</label>
            <textarea
              name="observacion"
              value={form.observacion || ''}
              onChange={handleChange}
              rows={2}
              placeholder="Detalles adicionales..."
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
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Registrando...' : 'Registrar movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMovimientoModal