import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Palette, Store, ArrowLeftRight,
  DollarSign, User, Users, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import Logotipo from '../assets/Logotipo.png';

const NAV_ITEMS = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard, roles: ['ADMIN', 'VENDEDOR'] },
  { to: '/productos',   label: 'Productos',   icon: Package,         roles: ['ADMIN'] },
  { to: '/colores',     label: 'Colores',     icon: Palette,         roles: ['ADMIN'] },
  { to: '/inventario',  label: 'Inventario',  icon: Store,           roles: ['ADMIN', 'VENDEDOR'] },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight,   roles: ['ADMIN', 'VENDEDOR'] },
  { to: '/ventas',      label: 'Ventas',      icon: DollarSign,      roles: ['ADMIN', 'VENDEDOR'] },
  { to: '/clientes',    label: 'Clientes',    icon: User,            roles: ['ADMIN'] },
  { to: '/usuarios',    label: 'Usuarios',    icon: Users,           roles: ['ADMIN'] },
  { to: '/sucursales',  label: 'Sucursales',  icon: Store,           roles: ['ADMIN'] },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen, collapsed, setCollapsed }: SidebarProps) => {
  
  const userRol = useMemo(() => {
    try {
      const user = JSON.parse(localStorage.getItem('usuario') || '{}');
      return user?.rol || 'VENDEDOR';
    } catch {
      return 'VENDEDOR';
    }
  }, []);

  const filteredNavItems = useMemo(() => 
    NAV_ITEMS.filter(item => item.roles.includes(userRol)), 
    [userRol]
  );

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 md:relative flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${collapsed ? 'md:w-20' : 'md:w-52 w-70'}`}
      >
        {/* Botón Flotante para Colapsar (Solo escritorio) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm hover:bg-blue-50 hover:border-blue-200 text-gray-500 hover:text-blue-600 transition-all z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Header con Logotipo */}
        <div className="relative flex items-center justify-center h-30 border-b border-gray-50 px-4 overflow-hidden">
          <img 
            src={Logotipo} 
            alt="Logotipo" 
            className={`transition-all duration-500 object-contain  ${
              collapsed ? 'w-13 h-13' : 'w-25 h-25'
            }`}
          />
          
          {/* Botón cerrar móvil */}
          <button 
            className="md:hidden absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full text-gray-600" 
            onClick={() => setIsOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1  px-3 flex flex-col gap-0.8 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : ""}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${collapsed ? 'justify-center' : 'justify-start'} 
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`}
                  />
                  {!collapsed && <span className="truncate font-normal">{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer (Opcional: información de usuario o versión) */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-50">
            <p className="text-[10px] text-center text-gray-300 font-medium tracking-widest uppercase">
              Inventario v1.0
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;