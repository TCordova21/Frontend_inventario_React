import { useState } from 'react'
import { X } from 'lucide-react'
import { createCliente } from '../../api/cliente.api'
import type { Cliente, CreateClienteDto } from '../../types/cliente.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (cliente: Cliente) => void
}

const EMPTY_FORM: CreateClienteDto = {
  nombre: '',
  contacto: '',
  tipo: '',
}

const CreateClienteModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.contacto.trim()) return setError('El contacto es obligatorio')

    try {
      setLoading(true)
      const nuevo = await createCliente(form)
      setForm(EMPTY_FORM)
      onSuccess(nuevo)
    } catch {
      setError('Error al crear cliente')
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
        className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Nuevo cliente
          </h2>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Contacto <span className="text-red-500">*</span>
            </label>
            <input
              name="contacto"
              value={form.contacto}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Tipo
            </label>
            <input
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              placeholder="VIP, Normal..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

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
              {loading ? 'Guardando...' : 'Crear cliente'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateClienteModal