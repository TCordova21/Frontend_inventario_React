import { useState, useEffect } from 'react'
import { X, UserCheck } from 'lucide-react'
import { createSucursal, updateSucursal } from '../../api/sucursal.api'
import { getUsuarios } from '../../api/usuarios.api'

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sucursalToEdit?: any;
  sucursalesExistentes: any[];
}

const CreateSucursalModal = ({ isOpen, onClose, onSuccess, sucursalToEdit, sucursalesExistentes }: Props) => {
  const [form, setForm] = useState({
    nombre: '',
    direccion: '',
    tipo: 'LOCAL',
    usuario_id: ''
  })
  const [vendedores, setVendedores] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      getUsuarios().then(data => {
        // 1. Extraemos IDs de usuarios ocupados de forma segura
        // Soporta tanto s.usuario_id como s.usuario.id
        const idsOcupados = (sucursalesExistentes || [])
          .filter(s => s.activo)
          .map(s => {
            const id = typeof s.usuario_id === 'object' ? s.usuario_id?.id : s.usuario_id;
            return id ? Number(id) : null;
          })
          .filter(id => id !== null);

        const usuariosBrutos = Array.isArray(data) ? data : [];

        const vendedoresFiltrados = usuariosBrutos.filter((u: any) => {
          const esVendedorActivo = Number(u.rol_id) === 2 && u.activo;
          const userId = Number(u.id);

          // Lógica de exclusión
          const estaOcupado = idsOcupados.includes(userId);

          // Si estamos editando, el que ya está asignado a ESTA sucursal debe ser visible
          const esElResponsableDeEstaEdicion = sucursalToEdit && Number(sucursalToEdit.usuario_id) === userId;

          if (esElResponsableDeEstaEdicion) return true;
          return esVendedorActivo && !estaOcupado;
        });

        setVendedores(vendedoresFiltrados)
      })

      if (sucursalToEdit) {
        setForm({
          nombre: sucursalToEdit.nombre,
          direccion: sucursalToEdit.direccion || '',
          tipo: sucursalToEdit.tipo || 'LOCAL',
          usuario_id: sucursalToEdit.usuario_id?.toString() || ''
        })
      } else {
        setForm({ nombre: '', direccion: '', tipo: 'LOCAL', usuario_id: '' })
      }
    }
  }, [isOpen, sucursalToEdit, sucursalesExistentes])

  if (!isOpen) return null

  // ... (handleSubmit se mantiene igual)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        usuario_id: (form.tipo !== 'MATRIZ' && form.usuario_id) ? Number(form.usuario_id) : undefined,
        activo: true
      }
      if (sucursalToEdit) {
        await updateSucursal(sucursalToEdit.id, payload)
      } else {
        await createSucursal(payload)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">

            {sucursalToEdit ? 'Editar Sucursal' : 'Nueva Sucursal'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Campos de Nombre, Tipo y Dirección (Tu diseño original) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ">Nombre de Sucursal</label>
            <input
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm focus:ring-2 focus:ring-blue-500/20"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Tipo</label>
            <select
              disabled={!!sucursalToEdit}
              className={`w-full px-3 py-2 rounded-lg border text-sm transition-all ${sucursalToEdit
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white border-gray-200'
                }`}
              value={form.tipo}
              onChange={e => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="LOCAL">Local</option>
              <option value="MATRIZ">Matriz</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ">Dirección</label>
            <input
              className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none text-sm"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
            />
          </div>

          {form.tipo === 'LOCAL' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <UserCheck size={12} /> Responsable Asignado
              </label>
              <select
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                value={form.usuario_id}
                onChange={e => setForm({ ...form, usuario_id: e.target.value })}
              >
                <option value="">Seleccionar un vendedor...</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.id}>{v.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500">
              Cancelar
            </button>
            <button
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Sucursal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSucursalModal