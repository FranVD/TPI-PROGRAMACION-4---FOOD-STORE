import { Link, useNavigate } from 'react-router-dom'
import { useLogout } from '@/features/auth/hooks/useAuth'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export function Navbar() {
  const navigate = useNavigate()
  const usuario = useAuthStore((state) => state.usuario)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const cantidadCarrito = useCartStore((state) => state.cantidadTotal())
  const logout = useLogout()

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/login') })
  }

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-stone-900">
          🍔 Food Store
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {usuario?.role === 'admin' && (
            <Link to="/admin" className="font-medium text-stone-700 hover:text-amber-700">
              Panel admin
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/mis-pedidos" className="font-medium text-stone-700 hover:text-amber-700">
              Mis pedidos
            </Link>
          )}

          <Link to="/carrito" className="relative font-medium text-stone-700 hover:text-amber-700">
            🛒 Carrito
            {cantidadCarrito > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs text-white">
                {cantidadCarrito}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
              <span className="text-stone-500">{usuario?.full_name}</span>
              <button onClick={handleLogout} className="font-medium text-stone-700 hover:text-amber-700">
                Salir
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-md bg-amber-600 px-3 py-1.5 font-medium text-white hover:bg-amber-700"
            >
              Ingresar
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
