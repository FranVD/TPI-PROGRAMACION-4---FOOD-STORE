import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/shared/api/types'
import { PantallaCargando } from '@/shared/ui/Spinner'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isChecking = useAuthStore((state) => state.isChecking)
  const usuario = useAuthStore((state) => state.usuario)
  const location = useLocation()

  if (isChecking) {
    return <PantallaCargando />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && usuario && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
