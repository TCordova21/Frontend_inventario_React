import { useState, useEffect } from 'react'
import { X,  Save } from 'lucide-react'
import { createCliente, updateCliente } from '../../api/cliente.api'
import type { Cliente, CreateClienteDto } from '../../types/cliente.types'
import { toast } from 'react-toastify'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  clienteToEdit?: Cliente | null // Prop para manejar edición
}

const EMPTY_FORM: CreateClienteDto = {
  nombre: '',
  contacto: '',
  tipo: 'Normal',
}

const CreateClienteModal = ({ isOpen, onClose, onSuccess, clienteToEdit }: Props) => {
  const [form, setForm] = useState<CreateClienteDto>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Efecto para cargar datos si se va a editar
  useEffect(() => {
    if (clienteToEdit) {
      setForm({
        nombre: clienteToEdit.nombre,
        contacto: clienteToEdit.contacto,
        tipo: clienteToEdit.tipo,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setError(null)
  }, [clienteToEdit, isOpen])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nombre.trim()) return setError('El nombre es obligatorio')
    if (!form.contacto.trim()) return setError('El contacto es obligatorio')

    try {
      setLoading(true)
      if (clienteToEdit) {
        await updateCliente(clienteToEdit.id, form)
        toast.success('Cliente actualizado correctamente')
      } else {
        await createCliente(form)
        toast.success('Cliente creado correctamente')
      }
      onSuccess()
      onClose()
    } catch (err) {
      setError('Ocurrió un error al procesar la solicitud')
      toast.error('Error en el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-100 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con estilo Elitex */}
        <div className="relative p-6 bg-slate-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {clienteToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <p className="text-xs  text-slate-400 mt-1">
                {clienteToEdit ? 'Actualizar información' : 'Registro de cartera'}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500 shadow-sm border border-transparent hover:border-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Campo Nombre */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700  flex items-center">
             
              Nombre Completo
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Campo Contacto */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700  flex items-center ">
              
              Teléfono / Contacto
            </label>
            <input
              name="contacto"
              value={form.contacto}
              onChange={handleChange}
              placeholder="099-999-9999"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Campo Tipo (Select para mejor UX) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 flex items-center ">
            
              Tipo de Cliente
            </label>
            <select
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50/50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all "
            >
              <option value="Normal">Normal</option>
              <option value="VIP">VIP</option>
              <option value="Distribuidor">Distribuidor</option>
              <option value="Frecuente">Frecuente</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[12px] font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-indigo-600 shadow-indigo-100 "
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  {clienteToEdit ? 'Actualizar' : 'Registrar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateClienteModal