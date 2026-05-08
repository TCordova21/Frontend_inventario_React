import { useState, useEffect } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import { toast } from 'react-toastify'
import { createNodo, updateNodo } from '../../api/nodo.api'
import type { CreateNodoDto, Nodo } from '../../types/nodo.types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  nodoToEdit?: Nodo | null
  padre_id?: number | null // <-- Importante: recibirlo aquí
  
}

const CreateNodoModal = ({ isOpen, onClose, onSuccess, nodoToEdit, padre_id }: Props) => {
  const [form, setForm] = useState<CreateNodoDto>({
    nombre: '',
    tipo: 'producto',
    imagen: '',
    padre_id: null
  })
  const [loading, setLoading] = useState(false)

  // Sincronizar el formulario
  useEffect(() => {
    if (isOpen) {
      if (nodoToEdit) {
        setForm({
          nombre: nodoToEdit.nombre,
          tipo: nodoToEdit.tipo,
          imagen: nodoToEdit.imagen || '',
          padre_id: nodoToEdit.padre_id
        })
      } else {
        // MODO CREACIÓN: Usamos el padre_id que viene por props
        setForm({ 
          nombre: '', 
          tipo: 'producto', 
          imagen: '', 
          padre_id: padre_id || null // <-- AQUÍ ESTABA EL ERROR
        })
      }
    }
  }, [isOpen, nodoToEdit, padre_id]) // Agregamos padre_id a las dependencias

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    try {
      setLoading(true)
      if (nodoToEdit) {
        await updateNodo(nodoToEdit.id, form)
        toast.info('Actualizado correctamente')
      } else {
        await createNodo(form)
        toast.success(padre_id ? 'Carpeta creada' : 'Producto creado')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  // Lógica de textos dinámicos para no dañar tu diseño
  const esSubcategoria = !!padre_id;
  const titulo = nodoToEdit 
    ? (esSubcategoria ? 'Editar Carpeta' : 'Editar Producto') 
    : (esSubcategoria ? 'Nueva Carpeta' : 'Nuevo Producto');

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{titulo}</h2>
            <p className="text-xs text-gray-500 mt-1">
              {esSubcategoria ? 'Organiza mejor tus diseños' : 'Define una nueva línea de catálogo'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Previsualización */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Vista previa</label>
            <div className="relative h-36 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
              {form.imagen ? (
                <img src={form.imagen} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400x300?text=Error+al+cargar')} />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon size={32} className="text-gray-300" />
                  <span className="text-[10px] text-gray-400 font-medium">Opcional para subcategorías</span>
                </div>
              )}
            </div>
          </div>

          {/* Campos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              autoComplete="off"
              value={form.nombre}
              onChange={handleChange}
              placeholder={esSubcategoria ? "Ej: Anime, Minimalista..." : "Ej: Ponchos Premium"}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">URL de la Imagen (Opcional)</label>
            <input
              type="text"
              name="imagen"
              value={form.imagen}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 ${
                nodoToEdit ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
              } shadow-lg`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                 
                  {nodoToEdit ? 'Guardar' : (esSubcategoria ? 'Crear Carpeta' : 'Crear Producto')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateNodoModal