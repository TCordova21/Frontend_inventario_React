import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'
import RoleGuard from '../components/RoleGuard'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Productos from '../pages/Productos'
import Disenos from '../pages/Disenos'
import Colores from '../pages/Colores'
import Inventario from '../pages/inventario/Inventario'
import Movimientos from '../pages/Movimientos'
import Ventas from '../pages/Ventas'
import Clientes from '../pages/Clientes'
import Usuarios from '../pages/Usuarios'
import Auditoria from '../pages/Auditoria'
import NotFound from '../pages/NotFound'
import ProductoDetalle from '../pages/productos/ProductoDetalle'
import CategoriaDetalle from '../pages/productos/CategoriaDetalle'
import SubcategoriaDetalle from '../pages/productos/SubcategoriaDetalle'
import DisenoDetalle from '../pages/productos/DisenoDetalle'
import ClienteDetalle from '../pages/clientes/ClienteDetalle'
import ClienteDisenoDetalle from '../pages/clientes/ClienteDisenoDetalle'
import NuevaVenta from '../pages/ventas/NuevaVenta'
import VentaDetalle from '../pages/ventas/DetalleVenta'
import NodoDetalle from '../pages/productos/NodoDetalle'
import Sucursales from '../pages/Sucursales'


const Root = () => <Outlet />

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      // Ruta pública — sin sidebar, sin protección
      {
        path: '/login',
        element: <Login />,
      },

      // Rutas protegidas — con sidebar
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            element: <Layout />,
            children: [

              { index: true, element: <Navigate to="/dashboard" replace /> },

              // 🔵 DASHBOARD
              {
                path: 'dashboard',
                element: (
                  <RoleGuard routeKey="dashboard">
                    <Dashboard />
                  </RoleGuard>
                ),
              },

              // 📦 PRODUCTOS
              {
                path: 'productos',
                children: [
                  {
                    index: true,
                    element: (
                      <RoleGuard routeKey="productos">
                        <Productos />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':productoId',
                    element: (
                      <RoleGuard routeKey="productos">
                        <ProductoDetalle />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':productoId/:categoriaId',
                    element: (
                      <RoleGuard routeKey="productos">
                        <CategoriaDetalle />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':productoId/:categoriaId/:subcategoriaId',
                    element: (
                      <RoleGuard routeKey="productos">
                        <SubcategoriaDetalle />
                      </RoleGuard>
                    ),
                  },
                ],
              },

              // 🎨 DISEÑOS
              {
                path: 'disenos',
                children: [
                  {
                    index: true,
                    element: (
                      <RoleGuard routeKey="disenos">
                        <Disenos />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':disenoId',
                    element: (
                      <RoleGuard routeKey="disenos">
                        <DisenoDetalle />
                      </RoleGuard>
                    ),
                  },
                ],
              },

              // 🎨 COLORES
              {
                path: 'colores',
                element: (
                  <RoleGuard routeKey="colores">
                    <Colores />
                  </RoleGuard>
                ),
              },

              // 📦 INVENTARIO
              {
                path: 'inventario',
                element: (
                  <RoleGuard routeKey="inventario">
                    <Inventario />
                  </RoleGuard>
                ),
              },

              // 🔁 MOVIMIENTOS
              {
                path: 'movimientos',
                element: (
                  <RoleGuard routeKey="movimientos">
                    <Movimientos />
                  </RoleGuard>
                ),
              },

              // 💰 VENTAS
              {
                path: 'ventas',
                children: [
                  {
                    index: true,
                    element: (
                      <RoleGuard routeKey="ventas">
                        <Ventas />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: 'nueva',
                    element: (
                      <RoleGuard routeKey="ventas">
                        <NuevaVenta />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':id',
                    element: (
                      <RoleGuard routeKey="ventas">
                        <VentaDetalle />
                      </RoleGuard>
                    ),
                  },
                ],
              },

              // 👤 CLIENTES
              {
                path: 'clientes',
                children: [
                  {
                    index: true,
                    element: (
                      <RoleGuard routeKey="clientes">
                        <Clientes />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':clienteId',
                    element: (
                      <RoleGuard routeKey="clientes">
                        <ClienteDetalle />
                      </RoleGuard>
                    ),
                  },
                  {
                    path: ':clienteId/disenos/:disenoId',
                    element: (
                      <RoleGuard routeKey="clientes">
                        <ClienteDisenoDetalle />
                      </RoleGuard>
                    ),
                  },
                ],
              },

              // 🔒 ADMIN ONLY
              {
                path: 'usuarios',
                element: (
                  <RoleGuard routeKey="usuarios">
                    <Usuarios />
                  </RoleGuard>
                ),
              },
              {
                path: 'auditoria',
                element: (
                  <RoleGuard routeKey="auditoria">
                    <Auditoria />
                  </RoleGuard>
                ),
              },
              {
                path: 'sucursales',
                element: (
                  <RoleGuard routeKey="sucursales">
                    <Sucursales />
                  </RoleGuard>
                ),
              },

              // 🌳 NODOS (IMPORTANTE FIX)
              {
                path: 'nodos',
                children: [
                  {
                    path: ':id',
                    element: (
                      <RoleGuard routeKey="nodos">
                        <NodoDetalle />
                      </RoleGuard>
                    ),
                  },
                ],
              },

            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])