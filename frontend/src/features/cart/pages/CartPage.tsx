import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { formatearMoneda } from '@/shared/format'
import { Button } from '@/shared/ui/Button'
import { EstadoVacio } from '@/shared/ui/Mensajes'

export function CartPage() {
  const { items, actualizarCantidad, quitar, total } = useCartStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()

  function irACheckout() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4">
        <EstadoVacio titulo="Tu carrito está vacío" descripcion="Agregá productos desde el catálogo." />
        <Link to="/">
          <Button variant="secondary">Ir al catálogo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Tu carrito</h1>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.producto_id}
            className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-white p-4"
          >
            <div className="flex-1">
              <p className="font-medium text-stone-900">{item.nombre}</p>
              <p className="text-sm text-stone-500">{formatearMoneda(item.precio_unitario)} c/u</p>
            </div>

            <input
              type="number"
              min={1}
              max={item.stock_disponible}
              value={item.cantidad}
              onChange={(e) => actualizarCantidad(item.producto_id, Math.min(Number(e.target.value), item.stock_disponible))}
              className="w-16 rounded-md border border-stone-300 px-2 py-1 text-center text-sm"
            />

            <span className="w-24 text-right font-semibold text-stone-900">
              {formatearMoneda(item.precio_unitario * item.cantidad)}
            </span>

            <button onClick={() => quitar(item.producto_id)} className="text-stone-400 hover:text-red-600">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="text-lg font-bold text-stone-900">Total</span>
        <span className="text-xl font-bold text-stone-900">{formatearMoneda(total())}</span>
      </div>

      <Button className="mt-4 w-full" onClick={irACheckout}>
        Continuar con la compra
      </Button>
    </div>
  )
}
