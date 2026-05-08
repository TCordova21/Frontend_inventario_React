import { useState, useEffect } from 'react'
import { X, User, Mail, Lock, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import { createUsuario, updateUsuario } from '../../api/usuarios.api'
import type { CreateUsuarioDto, Usuario } from '../../types/usuario.types'

interface Props {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    usuarioToEdit?: Usuario | null
}

const EMPTY_FORM: CreateUsuarioDto = {
    nombre: '',
    email: '',
    apellido:'',
    password: '',
    rol_id: 2, // Vendedor por defecto
}

const CreateUsuarioModal = ({ isOpen, onClose, onSuccess, usuarioToEdit }: Props) => {
    const [form, setForm] = useState<CreateUsuarioDto>(EMPTY_FORM)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (usuarioToEdit) {
                setForm({
                    nombre: usuarioToEdit.nombre,
                    apellido: usuarioToEdit.apellido,
                    email: usuarioToEdit.email,
                    password: '', // Password siempre vacío al editar
                    rol_id: usuarioToEdit.rol_id
                })
            } else {
                setForm(EMPTY_FORM)
            }
        }
    }, [isOpen, usuarioToEdit])

    if (!isOpen) return null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.nombre.trim() || !form.email.trim()) {
            return toast.error('Nombre y Email son obligatorios')
        }

        try {
            setLoading(true)
            if (usuarioToEdit) {
                await updateUsuario(usuarioToEdit.id, form)
                toast.info('Usuario actualizado')
            } else {
                await createUsuario({ ...form, rol_id: Number(form.rol_id) })
                toast.success('Usuario creado con éxito')
            }
            onSuccess()
            onClose()
        } catch (error) {
            toast.error('Error al procesar la solicitud')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {usuarioToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Gestión de accesos y permisos</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {/* Nombre */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600  ml-1">Nombre</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Juan"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                       {/* Apellido */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600  ml-1">Apellido</label>
                        <div className="relative">
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                placeholder="Ej: Pérez"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600  ml-1">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="correo@elitex.com"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600  ml-1">
                            {usuarioToEdit ? 'Cambiar Contraseña (Opcional)' : 'Contraseña'}
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Rol */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-600  ml-1">Rol de Usuario</label>
                        <div className="relative">
                            <Shield size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="rol_id"
                                value={form.rol_id}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm appearance-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all bg-white"
                            >
                                <option value={1}>Administrador</option>
                                <option value={2}>Vendedor</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? 'Guardando...' : (usuarioToEdit ? 'Guardar Cambios' : 'Crear Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateUsuarioModal