import { useState, useEffect, useCallback } from 'react' // Añadido useCallback
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronRight, ImageOff } from 'lucide-react'
import { getDisenosByCliente } from '../../api/cliente.api'
import type { ClienteDiseno } from '../../types/cliente.types'
import LoadingScreen from '../../components/LoadingScreen'
import type {  DisenoColor } from '../../types/diseno.types'
import { getDisenoColorsByDiseno } from '../../api/disenoColor.api'
import { getImageUrl } from '../../utils/image'


const ClienteDisenoDetalle = () => {
    const { clienteId, disenoId } = useParams()
    const navigate = useNavigate()

    const [disenoCliente, setDisenoCliente] = useState<ClienteDiseno | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false) // Estado para manejar errores de carga
    const [colores, setColores] = useState<DisenoColor[]>([])

    // Usamos useCallback para que la función no se recree en cada render
    const fetchData = useCallback(async () => {
        if (!clienteId || !disenoId) return

        try {
            setLoading(true)
              const [c] = await Promise.all([
                          
                            getDisenoColorsByDiseno(Number(disenoId)),
                        ])
            setError(false)
             setColores(Array.isArray(c) ? c : [])

            const data = await getDisenosByCliente(Number(clienteId))
            
            // Verificamos que d.diseno_id coincida con el ID de la URL
            const encontrado = data.find(
                (d) => d.diseno_id === Number(disenoId)
                
            )

            if (encontrado) {
                setDisenoCliente(encontrado)
            } else {
                setError(true)
            }
        } catch (err) {
            console.error("Error fetching detail:", err)
            setError(true)
        } finally {
            setLoading(false)
        }
    }, [clienteId, disenoId])

    useEffect(() => { 
        fetchData() 
    }, [fetchData])

    if (loading) return <LoadingScreen />

    // Si hay error o no se encontró el diseño
    if (error || !disenoCliente || !disenoCliente.disenos) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="text-gray-400 text-sm italic shadow-sm p-4 bg-gray-50 rounded-lg border">
                    Diseño no encontrado o no pertenece a este cliente
                </div>
                <button 
                    onClick={() => navigate(`/clientes/${clienteId}`)}
                    className="text-blue-500 text-xs hover:underline"
                >
                    Volver al cliente
                </button>
            </div>
        )
    }

    // Alias para facilitar la lectura
    const diseno = disenoCliente.disenos
   

    return (
        <div className="p-4 md:p-6 animate-in fade-in duration-500">
            {/* Breadcrumb - Corregido navegación */}
            <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
                <button
                    onClick={() => navigate('/clientes')}
                    className="hover:text-blue-500 transition-colors"
                >
                    Clientes
                </button>

                <ChevronRight size={14} className="shrink-0" />

                <button
                    onClick={() => navigate(`/clientes/${clienteId}`)}
                    className="hover:text-blue-500 transition-colors"
                >
                    Detalle Cliente
                </button>

                <ChevronRight size={14} className="shrink-0" />

                <span className="text-gray-700 font-semibold truncate">
                    {diseno.nombre}
                </span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {/* Columna Imagen */}
                <div className="md:col-span-1 w-full space-y-4">
                    <div className="aspect-square w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center p-2">
                        {diseno.imagen ? (
                            <img
                                src={getImageUrl(diseno.imagen)}
                                alt={diseno.nombre}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-300">
                                <ImageOff size={48} strokeWidth={1} />
                                <span className="text-[10px] uppercase font-medium">Sin imagen</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${
                            diseno.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                            {diseno.activo ? 'Activo' : 'Inactivo'}
                        </span>

                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${
                            disenoCliente.exclusivo ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'
                        }`}>
                            {disenoCliente.exclusivo ? 'Exclusivo' : 'Público'}
                        </span>
                    </div>
                </div>

                {/* Columna Información */}
                <div className="md:col-span-3 flex flex-col gap-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{diseno.nombre}</h1>
                                <code className="text-blue-500 text-xs font-mono">{diseno.codigo}</code>
                                {diseno.descripcion && (
                                    <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                                        {diseno.descripcion}
                                    </p>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 min-w-30 text-center">
                                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Precio Unitario</p>
                                <span className="text-2xl font-black text-gray-800">
                                    ${Number(diseno.precio || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Colores */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-tight mb-4">
                            Colores
                        </h2>

                        {colores.length === 0 ? (
                            <div className="py-8 text-center border-2 border-dashed border-gray-50 rounded-2xl">
                                <p className="text-xs text-gray-400">No hay variaciones de color disponibles.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {colores.map((c) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-colors group"
                                    >
                                        <div 
                                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm shrink-0 group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: c.colores?.codigo_hex || '#eee' }}
                                        />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-700 truncate">
                                                {c.colores?.nombre}
                                            </p>
                                            <p className="text-[10px] font-mono text-gray-400 uppercase">
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