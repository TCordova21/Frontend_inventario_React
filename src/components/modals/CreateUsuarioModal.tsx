import { useState } from 'react'
import { X } from 'lucide-react'
import { createUsuario } from '../../api/usuarios.api'
import type { CreateUsuarioDto, Usuario } from '../../types/usuario.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (usuario: Usuario) => void
}

const EMPTY_FORM: CreateUsuarioDto = {
  nombre: '',
  email: '',
  password: '',
  rol_id: 1,
}

const CreateUsuarioModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState<CreateUsuarioDto>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nombre.trim()) return setError('Nombre obligatorio')
    if (!form.email.trim()) return setError('Email obligatorio')
    if (!form.password.trim()) return setError('Password obligatorio')

    try {
      setLoading(true)
      const usuario = await createUsuario({
        ...form,
        rol_id: Number(form.rol_id),
      })

      setForm(EMPTY_FORM)
      onSuccess(usuario)
    } catch {
      setError('Error al crear usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-5">
          <h2 className="text-lg font-semibold">Nuevo usuario</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            className="input"
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="input"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="input"
          />

          <select
            name="rol_id"
            value={form.rol_id}
            onChange={handleChange}
            className="input"
          >
            <option value={1}>ADMIN</option>
            <option value={2}>VENDEDOR</option>
          </select>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Crear'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateUsuarioModal