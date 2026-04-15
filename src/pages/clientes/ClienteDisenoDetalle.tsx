import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ImageOff } from 'lucide-react'
import { getDisenosByCliente } from '../../api/cliente.api'
import type { ClienteDiseno } from '../../types/cliente.types'
import LoadingScreen from '../../components/LoadingScreen'

const ClienteDisenoDetalle = () => {
    const { clienteId, disenoId } = useParams()
    const navigate = useNavigate()

    const [disenoCliente, setDisenoCliente] = useState<ClienteDiseno | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            setLoading(true)

            const data = await getDisenosByCliente(Number(clienteId))

            const encontrado = data.find(
                (d) => d.diseno_id === Number(disenoId)
            )

            setDisenoCliente(encontrado || null)

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [clienteId, disenoId])

    if (loading) return <LoadingScreen />

    if (!disenoCliente || !disenoCliente.disenos) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Diseño no encontrado
            </div>
        )
    }

    const diseno = disenoCliente.disenos
    const colores = diseno.diseno_color || []

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

                <ChevronRight size={14} />

                <button
                    onClick={() => navigate(`/clientes/${clienteId}`)}
                    className="hover:text-blue-500 transition-colors"
                >
                    Cliente
                </button>

                <ChevronRight size={14} />

                <span className="text-gray-700 font-medium">
                    {diseno.nombre}
                </span>
            </div>

            {/* Layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">

                {/* Imagen */}
                <div className="md:col-span-1 w-full">
                    <div className="aspect-square md:h-64 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        {diseno.imagen ? (
                            <img
                                src={diseno.imagen}
                                alt={diseno.nombre}
                                className="w-full h-full object-scale-down"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-300">
                                <ImageOff size={40} />
                                <span className="text-xs">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${diseno.activo
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-600'
                            }`}>
                            {diseno.activo ? 'Activo' : 'Inactivo'}
                        </span>

                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${disenoCliente.exclusivo
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-50 text-blue-600'
                            }`}>
                            {disenoCliente.exclusivo ? 'Exclusivo' : 'Normal'}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="md:col-span-3 flex flex-col gap-5">

                    {/* Card info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                            <div>
                                <h1 className="text-xl md:text-2xl font-semibold text-gray-800 mb-1">
                                    {diseno.nombre}
                                </h1>

                                <p className="text-xs font-mono text-gray-400 mb-2">
                                    {diseno.codigo}
                                </p>

                                {diseno.descripcion && (
                                    <p className="text-sm text-gray-500">
                                        {diseno.descripcion}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                                {diseno.precio ? (
                                    <span className="text-xl font-bold text-gray-800">
                                        ${parseFloat(String(diseno.precio)).toFixed(2)}
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">
                                        Sin precio
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Colores (solo visual) */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <div className="mb-4">
                            <h2 className="text-base font-semibold text-gray-800">
                                Colores disponibles
                            </h2>
                            <p className="text-xs text-gray-400">
                                {colores.length} colores
                            </p>
                        </div>

                        {colores.length === 0 ? (
                            <div className="flex items-center justify-center py-10 text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                Sin colores configurados
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {colores.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl"
                                    >
                                        <span
                                            className="w-8 h-8 rounded-full border border-white shadow"
                                            style={{ backgroundColor: c.colores?.codigo_hex }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-700 truncate">
                                                {c.colores?.nombre}
                                            </p>
                                            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                                                {c.colores?.codigo_hex}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ClienteDisenoDetalle