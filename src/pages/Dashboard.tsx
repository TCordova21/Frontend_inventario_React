import { useEffect, useState } from 'react'
import {
  Package,
  Users,
  AlertTriangle,
  TrendingDown,
  Palette,
  ArrowUpRight,
  History,
  ChevronRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom' // Asumiendo que usas react-router

import { getInventario } from '../api/inventario.api'
import { getDisenos } from '../api/disenos.api'
import { getClientes } from '../api/cliente.api'
import { getMovimientos } from '../api/movimiento.api' // Nueva API

import type { Inventario } from '../types/inventario.types'
import type { Diseno } from '../types/diseno.types'
import type { Cliente } from '../types/cliente.types'
import type { Movimiento } from '../types/movimiento.types'

import LoadingScreen from '../components/LoadingScreen'

const Dashboard = () => {
  const [inventario, setInventario] = useState<Inventario[]>([])
  const [disenos, setDisenos] = useState<Diseno[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [inv, dis, cli, movs] = await Promise.all([
        getInventario(),
        getDisenos(),
        getClientes(),
        getMovimientos()
      ])

      setInventario(Array.isArray(inv) ? inv : [])
      setDisenos(Array.isArray(dis) ? dis : [])
      setClientes(Array.isArray(cli) ? cli : [])
      setMovimientos(Array.isArray(movs) ? movs.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      ) : [])

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <LoadingScreen />

  // Métricas
  const stockBajo = inventario.filter(i => i.cantidad <= i.stock_minimo && i.cantidad > 0).length
  const sinStock = inventario.filter(i => i.cantidad === 0).length
  const inventarioCritico = inventario.filter(i => i.cantidad <= i.stock_minimo)

  return (
    <div className="p-6 bg-gray-50/50 ">
      
      {/* Header con saludo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
          <p className="text-sm text-gray-500">Resumen operativo — Matriz Otavalo</p>
        </div>
        
      </div>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        
        <MetricCard 
          icon={<Palette size={20}/>} 
          label="Diseños" 
          value={disenos.length} 
          color="blue" 
        />
        <MetricCard 
          icon={<Users size={20}/>} 
          label="Clientes" 
          value={clientes.length} 
          color="green" 
        />
        <MetricCard 
          icon={<TrendingDown size={20}/>} 
          label="Stock Bajo" 
          value={stockBajo} 
          color="amber" 
          isWarning={stockBajo > 0}
        />
        <MetricCard 
          icon={<Package size={20}/>} 
          label="Sin Stock" 
          value={sinStock} 
          color="red" 
          isCritical={sinStock > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: Inventario Crítico */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h2 className="text-sm font-bold text-gray-800">Alertas de Stock</h2>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                {inventarioCritico.length}
              </span>
            </div>
            <div className="p-2">
              {inventarioCritico.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs">No hay alertas pendientes</div>
              ) : (
                <div className="space-y-1">
                  {inventarioCritico.slice(0, 6).map((i) => (
                    <div key={i.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-700">{i.disenos?.nombre}</span>
                        <span className="text-[10px] text-gray-400">Mín: {i.stock_minimo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${i.cantidad === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                          {i.cantidad} un.
                        </span>
                        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-500 cursor-pointer" 
                          onClick={() => navigate('/inventario') }/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* COLUMNA 2: Actividad Reciente (Movimientos) */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={18} className="text-purple-500" />
                <h2 className="text-sm font-bold text-gray-800">Actividad Reciente</h2>
              </div>
              <button className="text-[10px] font-bold text-blue-600 hover:underline"
              onClick={() => navigate('/movimientos') }
              >VER TODO</button>
            </div>
            <div className="p-4">
              <div className="relative border-l-2 border-gray-100 ml-2 space-y-6">
                {movimientos.slice(0, 4).map((m) => (
                  <div key={m.id} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      m.tipo_movimiento === 'ENTRADA' ? 'bg-purple-500' : 
                      m.tipo_movimiento === 'VENTA' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-800">{m.tipo_movimiento}</span>
                      <span className="text-[11px] text-gray-600 line-clamp-1">{m.disenos?.nombre}</span>
                      <span className="text-[10px] text-gray-400 mt-1">
                        {new Date(m.fecha).toLocaleDateString()} • {m.cantidad} unidades
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* COLUMNA 3: Diseños Destacados / Últimos */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm">
             <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-blue-500" />
                <h2 className="text-sm font-bold text-gray-800">Nuevos Diseños</h2>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 gap-4">
              {disenos.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                    {d.imagen && <img src={d.imagen} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate uppercase tracking-wider">{d.nombre}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{d.codigo}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-600" />
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}

// Sub-componente para las tarjetas de métricas para mantener el código limpio
const MetricCard = ({ icon, label, value, color, isWarning, isCritical }: any) => {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-green-600 bg-green-50 border-green-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-red-600 bg-red-50 border-red-100',
  }

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
      isCritical ? 'border-red-200 ring-1 ring-red-50' : 
      isWarning ? 'border-amber-200' : 'border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          {icon}
        </div>
        {isCritical && <span className="flex h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-tight">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  )
}

export default Dashboard