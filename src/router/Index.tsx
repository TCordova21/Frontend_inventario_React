import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
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

export const router = createBrowserRouter([
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            {
                element: <Layout />,
                children: [
                    { index: true, element: <Navigate to="/dashboard" replace /> },
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'productos', element: <Productos /> },
                    { path: 'disenos', element: <Disenos /> },
                    { path: 'colores', element: <Colores /> },
                    { path: 'inventario', element: <Inventario /> },
                    { path: 'movimientos', element: <Movimientos /> },
                    { path: 'ventas', element: <Ventas /> },
                    { path: 'clientes', element: <Clientes /> },
                    { path: 'usuarios', element: <Usuarios /> },
                    { path: 'auditoria', element: <Auditoria /> },
                    { path: 'productos', element: <Productos /> },
                    { path: 'productos/:productoId', element: <ProductoDetalle /> },
                    { path: 'productos/:productoId/:categoriaId', element: <CategoriaDetalle /> },
                    { path: 'productos/:productoId/:categoriaId/:subcategoriaId', element: <SubcategoriaDetalle /> },
                    { path: 'productos/:productoId/:categoriaId/:subcategoriaId/:disenoId', element: <DisenoDetalle /> },
                    { path: 'clientes/:clienteId', element: <ClienteDetalle /> },
                    { path: 'clientes/:clienteId/disenos/:disenoId', element: <ClienteDisenoDetalle /> },
                    { path: 'ventas/nueva', element: <NuevaVenta /> },
                    { path: 'ventas/:ventaId', element: <VentaDetalle /> }
                ],
            },
        ],
    },
    { path: '*', element: <NotFound /> },
])