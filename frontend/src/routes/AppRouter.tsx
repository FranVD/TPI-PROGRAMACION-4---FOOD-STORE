import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/shared/layout/AppLayout'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { UnauthorizedPage } from '@/shared/components/UnauthorizedPage'
import { NotFoundPage } from '@/shared/components/NotFoundPage'

import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { CatalogPage } from '@/features/catalog/pages/CatalogPage'
import { CartPage } from '@/features/cart/pages/CartPage'
import { CheckoutPage } from '@/features/cart/pages/CheckoutPage'
import { MyOrdersPage } from '@/features/orders/pages/MyOrdersPage'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { AdminDashboardPage } from '@/features/admin/pages/AdminDashboardPage'
import { AdminCategoriasPage } from '@/features/admin/pages/AdminCategoriasPage'
import { AdminProductosPage } from '@/features/admin/pages/AdminProductosPage'
import { AdminPedidosPage } from '@/features/admin/pages/AdminPedidosPage'
import { AdminUsuariosPage } from '@/features/admin/pages/AdminUsuariosPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* públicas */}
        <Route index element={<CatalogPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="carrito" element={<CartPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* cliente autenticado (cualquier rol) */}
        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="mis-pedidos" element={<MyOrdersPage />} />
          <Route path="mis-pedidos/:id" element={<OrderDetailPage />} />
        </Route>

        {/* solo admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="categorias" element={<AdminCategoriasPage />} />
            <Route path="productos" element={<AdminProductosPage />} />
            <Route path="pedidos" element={<AdminPedidosPage />} />
            <Route path="usuarios" element={<AdminUsuariosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
