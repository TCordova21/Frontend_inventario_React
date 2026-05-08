import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router/Index'
import './index.css'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        theme="light" 
      />
  </StrictMode>
)