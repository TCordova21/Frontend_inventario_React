import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, Palette, Store, ArrowLeftRight,
  DollarSign, User, Users,  ChevronLeft, ChevronRight, X
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/productos',  label: 'Productos',  icon: Package         },
  { to: '/colores',    label: 'Colores',    icon: Palette         },
  { to: '/inventario', label: 'Inventario', icon: Store           },
  { to: '/movimientos', label: 'Movimientos',icon: ArrowLeftRight  },
  { to: '/ventas',      label: 'Ventas',     icon: DollarSign      },
  { to: '/clientes',    label: 'Clientes',   icon: User            },
  { to: '/usuarios',    label: 'Usuarios',   icon: Users           },
/*  { to: '/auditoria',   label: 'Auditoría',  icon: ScrollText      },*/
]

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }: SidebarProps) => {
  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${collapsed ? 'md:w-16' : 'md:w-60 w-64'}`}
      >
        {/* Logo */}
        <div className={`flex items-center justify-between px-4 py-5 border-b border-gray-100 ${
          collapsed ? 'md:justify-center' : ''
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            {(!collapsed || isOpen) && (
              <span className="text-gray-800 font-semibold text-sm">Elitex</span>
            )}
          </div>
          
          {/* Botón cerrar solo móvil */}
          <button className="md:hidden p-1 text-gray-500" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsOpen(false)} // Cerrar al navegar en móvil
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  collapsed ? 'md:justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={18}
                    className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                  {(!collapsed || isOpen) && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Botón colapsar (Solo visible en escritorio) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} className="text-gray-500" /> : <ChevronLeft size={12} className="text-gray-500" />}
        </button>
      </aside>
    </>
  )
}

export default Sidebar