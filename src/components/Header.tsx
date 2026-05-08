import { useState } from 'react'
import { Bell, LogOut, ChevronDown, Menu, User, Check, ArrowRightLeft, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNotificaciones } from '../hooks/useNotificaciones'
import { confirmarMovimiento } from '../api/movimiento.api'
import { toast } from 'react-toastify'
import type { Movimiento } from '../types/movimiento.types'

import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  onOpenMenu: () => void
}

const Header = ({ onOpenMenu }: HeaderProps) => {
  const { usuario, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
   const navigate = useNavigate()

  const esAdmin = usuario?.rol === 'ADMIN'

  const { pendientes, loading: loadingNotif, refetch } = useNotificaciones(
    esAdmin ? undefined : usuario?.sucursal_id ?? undefined
  )
  const initials = usuario?.nombre?.charAt(0).toUpperCase() || ''

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha)
    const ahora = new Date()
    const diffMs = ahora.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHrs = Math.floor(diffMin / 60)

   

    if (diffMin < 1) return 'Ahora mismo'
    if (diffMin < 60) return `Hace ${diffMin} min`
    if (diffHrs < 24) return `Hace ${diffHrs}h`
    return d.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })
  }




  return (
    <header className="h-17 bg-white border-b border-gray-200 px-10 flex items-center justify-between sticky top-0 z-40 shrink-0">

      {/* Lado Izquierdo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onOpenMenu}
          className="sm:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Lado Derecho */}
      <div className="flex items-center gap-2">

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false) }}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl relative transition-colors"
          >
            <Bell size={20} />
            {pendientes.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[9px] font-black text-white leading-none px-0.5">
                  {pendientes.length > 9 ? '9+' : pendientes.length}
                </span>
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header notificaciones */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-800">Movimientos pendientes</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {esAdmin ? 'Todos los locales' : usuario?.nombre_sucursal}
                    </p>
                  </div>
                  {pendientes.length > 0 && (
                    <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      {pendientes.length} pendiente{pendientes.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Lista */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                  {loadingNotif ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : pendientes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                        <Check size={20} className="text-green-500" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Todo al día</p>
                      <p className="text-xs text-gray-300">No hay movimientos pendientes</p>
                    </div>
                  ) : (
                    pendientes.map((mov) => (
                      <div
                        key={mov.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Ícono */}
                          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <ArrowRightLeft size={14} className="text-amber-500" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">
                                {mov.tipo_movimiento}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">#{mov.id}</span>
                            </div>

                            <p className="text-xs font-semibold text-gray-700 truncate">
                              {mov.disenos?.nombre || mov.nodos?.nombre || mov.referencia}
                            </p>

                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {(mov as any).sucursales_movimientos_inventario_sucursal_origen_idTosucursales?.nombre || 'Origen'} → destino
                            </p>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock size={10} />
                                {formatFecha(mov.fecha)}
                              </div>
                              <span className="text-[10px] font-black text-gray-600">
                                {mov.cantidad} uds
                              </span>
                            </div>
                          </div>
                        </div>


                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {pendientes.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                    <button
                       onClick={() => { navigate('/movimientos'); setNotifOpen(false) }}

                      className="text-xs text-blue-600 hover:text-blue-700 font-bold transition-colors"
                    >
                      Ver en movimientos →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Perfil */}
        <div className="relative">
          <button
            onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false) }}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shrink-0 shadow-md border-2 border-white">
              <span className="text-white text-xs font-bold">{initials || <User size={14} />}</span>
            </div>

            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-gray-700">{usuario?.nombre}</span>
              <span className="text-[10px] text-gray-400 font-medium">Mi Perfil</span>
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl border border-gray-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-5 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{usuario?.nombre} {usuario?.apellido}</p>
                      <p className="text-[11px] text-gray-500 truncate">{usuario?.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                    {usuario?.rol}
                  </span>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => { logout(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
                  >
                    <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded-lg">
                      <LogOut size={16} />
                    </div>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header