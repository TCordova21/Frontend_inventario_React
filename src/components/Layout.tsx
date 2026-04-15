import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false) // Estado para móvil
  const [collapsed, setCollapsed] = useState(false) // Estado para escritorio

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">
      <Sidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header simple para móvil para abrir el menú */}
        <header className="md:hidden flex items-center px-4 py-3 bg-white border-b border-gray-200">
          <button 
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <Menu size={24} />
          </button>
          <span className="ml-3 font-semibold text-gray-800">Elitex</span>
        </header>

        <main className="flex-1 overflow-y-auto h-full p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout