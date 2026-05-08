import { useState, useEffect, useMemo } from 'react'
import {
    Clock, AlertTriangle, Boxes, TrendingUp,
    CheckCircle2,
    RotateCcw,
    User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// API e Interfaces
import { getInventario } from '../../api/inventario.api'
import { getMovimientos } from '../../api/movimiento.api'
import { getVentas } from '../../api/venta.api'
import type { Inventario } from '../../types/inventario.types'
import type { Movimiento } from '../../types/movimiento.types'

// Componentes
import LoadingScreen from '../../components/LoadingScreen'
import { useAuth } from '../../context/AuthContext'

const VendedorDashboard = () => {
    const navigate = useNavigate()
    const { usuario } = useAuth()

    // --- ESTADOS ---
    const [inventario, setInventario] = useState<Inventario[]>([])
    const [movimientos, setMovimientos] = useState<Movimiento[]>([])
    const [ventas, setVentas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // --- CARGA DE DATOS ---
    const fetchData = async () => {
        try {
            setLoading(true)
            const [inv, movs, vtas] = await Promise.all([
                getInventario(),
                getMovimientos(),
                getVentas()
            ])

            const sucursalId = usuario?.sucursal_id

            // 🔥 FILTRO CLAVE POR SUCURSAL
            setInventario(Array.isArray(inv) ? inv.filter(i => i.sucursal_id === sucursalId) : [])
            setMovimientos(Array.isArray(movs) ? movs.filter(m =>
                m.sucursal_origen_id === sucursalId || m.sucursal_destino_id === sucursalId
            ) : [])
            setVentas(Array.isArray(vtas) ? vtas.filter(v => v.sucursal_id === sucursalId) : [])

        } catch (error) {
            console.error("Error cargando dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (usuario) fetchData()
    }, [usuario])

    // --- LÓGICA DE MÉTRICAS (CÁLCULOS MEMOIZADOS) ---
    const hoy = new Date().toDateString()

    const metrics = useMemo(() => {
        const vtasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === hoy)
        const ingresos = vtasHoy.reduce((acc, v) => acc + Number(v.total || 0), 0)
        const pendientes = movimientos.filter(m => m.estado === 'PENDIENTE' && m.sucursal_destino_id === usuario?.sucursal_id)
        const critico = inventario.filter(i => i.cantidad <= (i.stock_minimo || 0))

        return {
            ventasConteo: vtasHoy.length,
            ingresosHoy: ingresos,
            pendientesConteo: pendientes.length,
            criticoConteo: critico.length,
            totalItems: inventario.length
        }
    }, [ventas, movimientos, inventario, hoy, usuario])

    const ultimasVentas = useMemo(() => {
        return [...ventas]
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            .slice(0, 5)
    }, [ventas])

    if (loading) return <LoadingScreen />

    return (
        <div className="p-6 bg-[#F8FAFC] min-h-screen">

            {/* Header Estilo Elitex */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Panel de Control</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Gestión operativa sucursal Elitex</p>
                </div>


            </div>

            {/* Métricas en Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-5">
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <p className="text-xs text-gray-400  mb-1">Ventas Hoy</p>
                    <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold text-gray-800">{metrics.ventasConteo}</p>
                        <p className="text-xs font-bold text-emerald-500 pb-1">${metrics.ingresosHoy.toFixed(2)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 ">
                    <div className="flex items-center gap-1.5 mb-1 text-amber-500">
                        <Clock size={12} />
                        <p className="text-xs text-gray-400 ">Pendientes</p>
                    </div>
                    <p className="text-2xl font-semibold text-amber-500">{metrics.pendientesConteo}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 ">
                    <div className="flex items-center gap-1.5 mb-1 text-red-500">
                        <AlertTriangle size={12} />
                        <p className="text-xs text-gray-400 ">Stock Crítico</p>
                    </div>
                    <p className="text-2xl font-semibold text-red-500">{metrics.criticoConteo}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 ">
                    <div className="flex items-center gap-1.5 mb-1 text-blue-500">
                        <Boxes size={12} />
                        <p className="text-xs text-gray-400 ">Inventario</p>
                    </div>
                    <p className="text-2xl font-semibold text-blue-600">{metrics.totalItems}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Lado Izquierdo: Acciones y Actividad */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Tarjetas de Acceso Rápido (Mantengo tus estilos de botones) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* ... botones anteriores ... */}
                    </div>

                    {/* Tabla de Actividad Reciente con TUS estilos de la página Movimientos */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                            <h2 className="font-bold text-gray-800">Últimas Ventas</h2>
                            <button
                                onClick={() => navigate('/ventas')}
                                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                            >
                                Ver Todo
                            </button>
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        Fecha y Hora
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        Referencia
                                    </th>
                                    <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        Responsable
                                    </th>
                                    <th className="px-4 py-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {ultimasVentas.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400 italic">
                                            No hay registros hoy
                                        </td>
                                    </tr>
                                ) : (
                                    ultimasVentas.map((v) => (
                                        <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    {/* Fecha de la venta añadida aquí */}
                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                        {new Date(v.fecha).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                                                    </span>
                                                    <span className="text-[10px] text-blue-600 font-bold">
                                                        {new Date(v.fecha).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                                                        <TrendingUp size={14} />
                                                    </div>
                                                    <span className="text-xs text-gray-700 font-medium">Venta #{v.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-start gap-2 text-emerald-600  shrink-0">
                                                        <User size={10} className="shrink-0 " />

                                                        <div className="flex items-center gap-2 text-gray-500">

                                                            <p className="text-[10px] font-medium truncate max-w-25">
                                                                {v.usuarios?.nombre || 'Admin'}
                                                            </p>
                                                        </div>
                                                    </div>


                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {v.estado === 'DEVUELTO' || v.estado === 'DEVUELTA' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase bg-amber-100 text-amber-700">
                                                        <RotateCcw size={12} /> {v.estado}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase bg-green-100 text-green-700">
                                                        <CheckCircle2 size={12} /> {v.estado || 'PAGADO'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-bold text-gray-600">
                                                    ${Number(v.total).toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VendedorDashboard;