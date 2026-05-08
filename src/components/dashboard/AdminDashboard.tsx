import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Clock3,
  Package,
  ShoppingBag,
  Activity,
} from 'lucide-react'

import { getInventario } from '../../api/inventario.api'
import { getMovimientos } from '../../api/movimiento.api'
import { getVentas } from '../../api/venta.api'

import type { Inventario } from '../../types/inventario.types'
import type { Movimiento } from '../../types/movimiento.types'

import LoadingScreen from '../../components/LoadingScreen'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)

  const [inventario, setInventario] = useState<Inventario[]>([])
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [ventas, setVentas] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const [inv, movs, vtas] = await Promise.all([
          getInventario(),
          getMovimientos(),
          getVentas()
        ])

        setInventario(Array.isArray(inv) ? inv : [])
        setMovimientos(Array.isArray(movs) ? movs : [])
        setVentas(Array.isArray(vtas) ? vtas : [])

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const hoy = new Date().toDateString()

  const ventasHoy = useMemo(() => {
    return ventas.filter(v =>
      new Date(v.fecha).toDateString() === hoy
    )
  }, [ventas])

  const ingresosHoy = useMemo(() => {
    return ventasHoy.reduce((acc, v) => {
      return acc + Number(v.total || 0)
    }, 0)
  }, [ventasHoy])

  const movimientosPendientes = useMemo(() => {
    return movimientos.filter(m => m.estado === 'PENDIENTE')
  }, [movimientos])

  const sinStock = useMemo(() => {
    return inventario.filter(i => i.cantidad === 0)
  }, [inventario])

  const stockCritico = useMemo(() => {
    return inventario.filter(i =>
      i.cantidad <= i.stock_minimo && i.cantidad > 0
    )
  }, [inventario])

  const actividadReciente = useMemo(() => {
    return [...movimientos]
      .sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      .slice(0, 8)
  }, [movimientos])
  

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-6">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold  text-gray-900">
          Dashboard
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Resumen operativo general
        </p>
      </div>

    {/* KPICards con el nuevo estilo de Ventas */}
<section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
  <KPICard
    title="Ventas Hoy"
    value={ventasHoy.length}
    subtitle={`$${ingresosHoy.toFixed(2)} generados`}
    icon={<ShoppingBag size={20} />}
    color="emerald"
  />

  <KPICard
    title="Pendientes"
    value={movimientosPendientes.length}
    subtitle="Movimientos por confirmar"
    icon={<Clock3 size={20} />}
    color="amber"
  />

  <KPICard
    title="Sin Stock"
    value={sinStock.length}
    subtitle="Productos agotados"
    icon={<Package size={20} />}
    color="red"
  />

  <KPICard
    title="Stock Crítico"
    value={stockCritico.length}
    subtitle="Bajo mínimo permitido"
    icon={<AlertTriangle size={20} />}
    color="blue"
  />
</section>

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 text-left">

        {/* ACTIVIDAD - USANDO TUS ESTILOS DE TABLA */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h2 className="font-bold text-gray-600">Actividad reciente</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Detalle</th>
                  <th className="px-4 py-3 text-center text-[10px] font-medium text-gray-400 uppercase tracking-wider">Cant.</th>
                  <th className="px-4 py-3 text-right text-[10px] font-medium text-gray-400 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {actividadReciente.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase ${
                        m.tipo_movimiento === 'VENTA' ? 'bg-emerald-100 text-emerald-700' : 
                        m.tipo_movimiento === 'TRASLADO' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {m.tipo_movimiento.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-700">{m.disenos?.nombre || m.nodos?.nombre}</p>
                     
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium text-gray-600">{m.cantidad}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[10px] text-gray-500 font-medium">
                        {new Date(m.fecha).toLocaleString('es-EC', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALERTAS - USANDO TUS ESTILOS COMPACTOS */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-600">Alertas críticas</h2>
                <p className="text-[10px] text-gray-400 font-medium">Revisar Stock</p>
              </div>
            </div>

            <div className="space-y-3">
              {[...sinStock, ...stockCritico].slice(0, 6).map((i) => (
                <div key={i.id} className={`p-3 rounded-lg border ${i.cantidad === 0 ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xs font-semibold text-gray-800 ">{i.disenos?.nombre}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Mínimo: {i.stock_minimo} un.</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-semibold ${i.cantidad === 0 ? 'bg-red-200 text-red-700' : 'bg-amber-200 text-amber-800'}`}>
                      {i.cantidad} Unidades
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </div>
  )
}

interface KPIProps {
  title: string
  value: number
  subtitle: string
  icon: React.ReactNode
  color: 'emerald' | 'amber' | 'red' | 'blue'
}
const KPICard = ({ title, value, subtitle, icon, color }: KPIProps) => {
  const colors = {
    emerald: { bg: 'bg-green-50', text: 'text-green-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color].bg} ${colors[color].text}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-400   tracking-wider">
          {title}
        </p>
        <p className="text-xl font-semibold text-gray-800">
          {value}
        </p>
        {/* Subtítulo opcional con el estilo de ingresos netos */}
        <p className={`text-[9px] font-medium mt-0.5 ${color === 'emerald' ? 'text-green-500' : 'text-gray-400'}`}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard