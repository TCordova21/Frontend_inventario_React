import { useState, useEffect } from 'react'
import { Search, Plus, UserCheck, UserMinus, ShieldCheck, Trash2, Edit3 } from 'lucide-react'
import { getUsuarios, deleteUsuario } from '../api/usuarios.api'
import type { Usuario } from '../types/usuario.types'
import CreateUsuarioModal from '../components/modals/CreateUsuarioModal'
import LoadingScreen from '../components/LoadingScreen'
import ConfirmAlert from '../components/ConfirmAlert'
import { toast } from 'react-toastify'

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    
    // Estados para Modales
    const [modalOpen, setModalOpen] = useState(false)
    const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const fetchData = async () => {
        try {
            setLoading(true)
            const data = await getUsuarios()
            setUsuarios(Array.isArray(data) ? data : [])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const handleSoftDelete = async () => {
        if (!deleteId) return
        try {
            await deleteUsuario(deleteId)
            toast.success("Usuario desactivado correctamente")
            fetchData()
        } catch {
            toast.error("Error al desactivar usuario")
        } finally {
            setDeleteId(null)
        }
    }

    const openEditModal = (u: Usuario) => {
        setUsuarioToEdit(u)
        setModalOpen(true)
    }

    // Lógica de filtrado
    const filtrados = usuarios.filter((u) =>
        u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    // Métricas
    const totalUsuarios = usuarios.length
    const activos = usuarios.filter(u => u.activo).length
    const inactivos = usuarios.filter(u => !u.activo).length
    const administradores = usuarios.filter(u => u.roles?.nombre?.toLowerCase().includes('admin')).length

    if (loading) return <LoadingScreen />

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                       
                        Usuarios
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">Gestión de personal de Elitex</p>
                </div>
                <button
                    onClick={() => { setUsuarioToEdit(null); setModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 w-full sm:w-auto"
                >
                    <Plus size={18} />
                    Nuevo usuario
                </button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-semibold text-gray-800">{totalUsuarios}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                        <UserCheck size={14} className="text-green-500" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Activos</p>
                    </div>
                    <p className="text-2xl font-semibold text-green-600">{activos}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                        <UserMinus size={14} className="text-red-400" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Inactivos</p>
                    </div>
                    <p className="text-2xl font-semibold text-red-500">{inactivos}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                        <ShieldCheck size={14} className="text-blue-500" />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Admins</p>
                    </div>
                    <p className="text-2xl font-semibold text-blue-600">{administradores}</p>
                </div>
            </div>

            {/* Buscador - REINTEGRADO */}
            <div className="relative mb-6 max-w-sm group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white"
                />
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider ">Usuario</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Apellido</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Rol</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Estado</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                                    No se encontraron usuarios que coincidan con la búsqueda.
                                </td>
                            </tr>
                        ) : (
                            filtrados.map((u) => (
                                <tr key={u.id} className={`hover:bg-gray-50/50 transition-colors ${!u.activo ? 'bg-gray-50/30' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                        <div className="flex items-center gap-3">
                                           
                                            {u.nombre}
                                        </div>
                                    </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                                        <div className="flex items-center gap-3">
                                           
                                            {u.apellido}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
                                            {u.roles?.nombre || 'Sin Rol'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 ">
                                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${
                                            u.activo ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                            {u.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => openEditModal(u)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar datos"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            {u.activo && (
                                                <button 
                                                    onClick={() => setDeleteId(u.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Desactivar usuario"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modales */}
            <CreateUsuarioModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setUsuarioToEdit(null); }}
                usuarioToEdit={usuarioToEdit}
                onSuccess={fetchData}
            />

            <ConfirmAlert
                isOpen={!!deleteId}
                title="¿Desactivar Usuario?"
                message="El acceso de este usuario será revocado temporalmente. Siempre puedes reactivarlo editando su perfil."
                onConfirm={handleSoftDelete}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    )
}

export default Usuarios