import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Package, Trash2, ShieldCheck, ArrowRight } from 'lucide-react'
import { getClienteById, getDisenosByCliente, unassignDiseno } from '../../api/cliente.api'
import { getDisenos } from '../../api/disenos.api'
import type { Cliente } from '../../types/cliente.types'
import type { Diseno } from '../../types/diseno.types'
import type { ClienteDiseno } from '../../types/cliente.types'
import AssignDisenoModal from '../../components/modals/AssignDisenoModal'
import LoadingScreen from '../../components/LoadingScreen'
import ConfirmAlert from '../../components/ConfirmAlert'
import {toast} from 'react-toastify'
import { getImageUrl } from '../../utils/image'

const ClienteDetalle = () => {
  const { clienteId } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [disenos, setDisenos] = useState<ClienteDiseno[]>([])
  const [allDisenos, setAllDisenos] = useState<Diseno[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    disenoId: number | null;
    disenoNombre: string;
  }>({
    isOpen: false,
    disenoId: null,
    disenoNombre: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [clienteData, disenosData, all] = await Promise.all([
        getClienteById(Number(clienteId)),
        getDisenosByCliente(Number(clienteId)),
        getDisenos()
      ])
      setCliente(clienteData)
      setDisenos(Array.isArray(disenosData) ? disenosData : [])
      setAllDisenos(Array.isArray(all) ? all : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [clienteId])

  const openConfirmUnassign = (e: React.MouseEvent, disenoId: number, nombre: string) => {
    e.stopPropagation()
    setAlertConfig({
      isOpen: true,
      disenoId,
      disenoNombre: nombre
    })
  }

  const handleConfirmUnassign = async () => {
    if (alertConfig.disenoId) {
      try {
        await unassignDiseno(Number(clienteId), alertConfig.disenoId)
        setAlertConfig({ ...alertConfig, isOpen: false, disenoId: null, disenoNombre: '' })
        await fetchData()
          toast.success('Se desasigno el diseño del cliente')
      
      } catch (error) {
        console.error("Error al desasignar", error)
      }
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 pb-2">
        <button onClick={() => navigate('/clientes')} className="hover:text-blue-500 transition-colors">
          Clientes
        </button>
        <ChevronRight size={14} className="shrink-0" />
        <span className="text-gray-700 font-medium">{cliente?.nombre}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{cliente?.nombre}</h1>
          <p className="text-sm text-gray-400 mt-1">{cliente?.contacto || 'Sin información de contacto'}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 w-full sm:w-auto"
        >
          <Plus size={18} />
          Asignar Diseño
        </button>
      </div>

      {/* Grid de Cards (Estilo Productos) */}
      {disenos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
          <Package size={40} className="text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">No hay diseños asignados a este cliente</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {disenos.map((dc) => (
            <div
              key={dc.id}
              onClick={() => navigate(`/clientes/${clienteId}/disenos/${dc.diseno_id}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-400 transition-all group overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Contenedor Imagen */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                {dc.disenos?.imagen ? (
                  <img 
                  src={getImageUrl(dc.disenos.imagen)}
                    alt={dc.disenos.nombre} 
                    className="w-full h-full object-scale-down group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-50">
                    <Package size={40} className="text-blue-200" />
                  </div>
                )}

                {/* Botón Eliminar Flotante */}
                <div className="md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-all duration-300 absolute inset-0 bg-black/5 flex items-start justify-end p-2">
                  <button 
                    onClick={(e) => openConfirmUnassign(e, dc.diseno_id!, dc.disenos?.nombre || '')} 
                    className="p-2.5 bg-white rounded-full text-gray-400 hover:text-red-600 transition-all hover:scale-110 shadow-lg active:scale-90"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Badge Exclusivo */}
                {dc.exclusivo && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-purple-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-2xl">
                    <ShieldCheck size={12} />
                    Exclusivo
                  </div>
                )}
              </div>

              {/* Contenido Card */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {dc.disenos?.nombre}
                  </p>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-medium text-gray-400">
                    {dc.disenos?.codigo || 'SIN-CODIGO'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODALES --- */}
      <AssignDisenoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          fetchData()
        }}
        clienteId={Number(clienteId)}
        disenos={allDisenos}
        disenosAsignados={disenos}
      />

      <ConfirmAlert 
        isOpen={alertConfig.isOpen}
        title="¿Desasignar diseño?"
        message={`Estás por quitar "${alertConfig.disenoNombre}" de la lista de este cliente. El diseño no se eliminará del sistema, solo se romperá el vínculo.`}
        confirmText="Quitar diseño"
        onConfirm={handleConfirmUnassign}
        onCancel={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        type="danger"
      />
    </div>
  )
}

export default ClienteDetalle