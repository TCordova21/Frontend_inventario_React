import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Header from './Header'
import SessionAlert from './SessionAlert'

import { useAuth } from '../context/AuthContext'


const Layout = () => {

  const [isOpen, setIsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const {
  showSessionAlert,
  secondsLeft,
  refreshAuth,
  logout
} = useAuth()
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-900">

      <Sidebar
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        <Header onOpenMenu={() => setIsOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:px-4 md:py-1 bg-gray-50">
          <Outlet />
        </main>

      </div>

      {/* ALERTA GLOBAL */}
      <SessionAlert
        isOpen={showSessionAlert}
        secondsLeft={secondsLeft}
        onExtend={refreshAuth}
        onLogout={logout}
      />

    </div>
  )
}

export default Layout