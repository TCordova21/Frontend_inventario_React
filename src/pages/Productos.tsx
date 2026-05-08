import { useState, useEffect } from 'react'
import { Plus, Package, ChevronRight, FolderTree, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getNodosRaiz, deleteNodo } from '../api/nodo.api'
import type { Nodo } from '../types/nodo.types'
import CreateNodoModal from '../components/modals/CreateNodoModal'
import ConfirmAlert from '../components/ConfirmAlert'
import LoadingScreen from '../components/LoadingScreen'

const Productos = () => {
  const [nodos, setNodos] = useState<Nodo[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedNodo, setSelectedNodo] = useState<Nodo | null>(null)

  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    id: number | null;
    mode: 'confirm' | 'warning';
    title: string;
    message: string;
  }>({
    open: false,
    id: null,
    mode: 'confirm',
    title: '',
    message: ''
  })

  const navigate = useNavigate()

  const fetchNodos = async () => {
    try {
      setLoading(true)
      const data = await getNodosRaiz()
      console.log("Datos recibidos del server:", data) // <--- Revisa esto en la consola F12
      setNodos(data)
    } catch (error) {
      toast.error("Error al cargar")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNodos() }, [])

  const handleEdit = (e: React.MouseEvent, n: Nodo) => {
    e.stopPropagation()
    setSelectedNodo(n)
    setModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent, n: Nodo) => {
    e.stopPropagation()
    // Si el total de diseños (recursivo) es > 0, protegemos la eliminación
    const tieneContenido = (n.total_disenos || 0) > 0 || (n._count?.other_nodos || 0) > 0

    if (tieneContenido) {
      setAlertConfig({
        open: true,
        id: null,
        mode: 'warning',
        title: 'Acción Restringida',
        message: 'No se puede eliminar: Este producto contiene carpetas o diseños (incluso en subcarpetas) que están activos.'
      })
      return
    }

    setAlertConfig({
      open: true,
      id: n.id,
      mode: 'confirm',
      title: '¿Eliminar producto?',
      message: 'Esta acción borrará el producto de forma permanente. No se puede deshacer.'
    })
  }

  const confirmDelete = async () => {
    if (alertConfig.mode === 'warning') {
      setAlertConfig(prev => ({ ...prev, open: false }))
      return
    }

    if (!alertConfig.id) return
    try {
      await deleteNodo(alertConfig.id)
      setNodos(prev => prev.filter(n => n.id !== alertConfig.id))
      toast.success('Producto eliminado correctamente')
    } catch (error) {
      toast.error('Error al eliminar el producto')
    } finally {
      setAlertConfig(prev => ({ ...prev, open: false, id: null }))
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-4 md:p-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">

            Productos
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {nodos.length} {nodos.length === 1 ? 'línea de producto' : 'líneas de productos'}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </div>

      {nodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
          <FolderTree size={48} className="text-gray-200" />
          <p className="text-gray-400 text-sm">No hay productos base registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {nodos.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate(`/nodos/${n.id}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all text-left group overflow-hidden flex flex-col cursor-pointer"
            >
              <div className="h-35 bg-gray-100 relative overflow-hidden">
                {n.imagen ? (
                  <img src={n.imagen} alt={n.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <Package size={48} className="text-blue-200" />
                  </div>
                )}

                <div className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-300 absolute inset-0 bg-black/10 md:bg-black/10 flex items-start justify-end gap-2 p-2">
                  <button onClick={(e) => handleEdit(e, n)} className="p-3 md:p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-all hover:scale-110 shadow-lg active:scale-90">
                    <Pencil size={16} />
                  </button>
                  <button onClick={(e) => handleDeleteClick(e, n)} className="p-3 md:p-2 bg-white rounded-full text-gray-700 hover:text-red-600 transition-all hover:scale-110 shadow-lg active:scale-90">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* BADGE: Ahora muestra el total acumulado */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-2xl text-[10px] font-medium text-blue-600 ">
                  {n.total_disenos ?? 0}    Diseños
                </div>
              </div>

              <div className="p-3 bg-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-800  group-hover:text-blue-600 transition-colors truncate">
                    {n.nombre}
                  </p>
                  <ArrowRight size={15} strokeWidth={3} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px]  font-medium text-gray-400">
                    {n._count?.other_nodos || 0} carpetas
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateNodoModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedNodo(null) }} onSuccess={fetchNodos} nodoToEdit={selectedNodo} />

      <ConfirmAlert
        isOpen={alertConfig.open}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={confirmDelete}
        onCancel={() => setAlertConfig(prev => ({ ...prev, open: false, id: null }))}
        confirmText={alertConfig.mode === 'warning' ? 'Entendido' : 'Eliminar'}
      />
    </div>
  )
}

export default Productos