import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, Plus, Package } from 'lucide-react'
import { getClienteById, getDisenosByCliente } from '../../api/cliente.api'
import { getDisenos } from '../../api/disenos.api'
import type { Cliente } from '../../types/cliente.types'
import type { Diseno } from '../../types/diseno.types'
import type { ClienteDiseno } from '../../types/cliente.types'
import AssignDisenoModal from '../../components/modals/AssignDisenoModal'
import LoadingScreen from '../../components/LoadingScreen'

const ClienteDetalle = () => {
  const { clienteId } = useParams()
  const navigate = useNavigate()

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [disenos, setDisenos] = useState<ClienteDiseno[]>([])
  const [allDisenos, setAllDisenos] = useState<Diseno[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

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

  if (loading) return <LoadingScreen />

  return (
    <div className="p-4 md:p-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        <button
          onClick={() => navigate('/clientes')}
          className="hover:text-blue-500 transition-colors"
        >
          Clientes
        </button>

        <ChevronRight size={14} className="shrink-0" />

        <span className="text-gray-700 font-medium">
          {cliente?.nombre}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {cliente?.nombre}
          </h1>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-500">
              {cliente?.contacto}
            </span>

            <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {cliente?.tipo}
            </span>

            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              cliente?.activo
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}>
              {cliente?.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus size={16} />
          Asignar diseño
        </button>
      </div>

      {/* Lista de diseños */}
      {disenos.length === 0 ? (

        <div className="flex flex-col items-center justify-center h-48 gap-3 border-2 border-dashed border-gray-100 rounded-xl">
          <p className="text-gray-400 text-sm">Este cliente no tiene diseños</p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} />
            Asignar primer diseño
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4"
        >
          {disenos.map((dc) => (
            <div
              key={dc.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden"
              onClick={() => navigate(`/clientes/${clienteId}/disenos/${dc.diseno_id}`)}
            >
              <div className="flex items-center gap-4 p-4">

                {/* Imagen */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-50">
                  {dc.disenos?.imagen ? (
                    <img
                      src={dc.disenos.imagen}
                      alt={dc.disenos.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {dc.disenos?.nombre}
                    </p>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      dc.exclusivo
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {dc.exclusivo ? 'Exclusivo' : 'Normal'}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-gray-400">
                    {dc.disenos?.codigo}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
    </div>
  )
}

export default ClienteDetalle