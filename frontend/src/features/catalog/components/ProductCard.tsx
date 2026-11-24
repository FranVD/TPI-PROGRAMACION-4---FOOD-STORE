import type { Producto } from '@/shared/api/types'
import { formatearMoneda } from '@/shared/format'
import { Button } from '@/shared/ui/Button'
import { useCartStore } from '@/store/cartStore'

export function ProductCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((state) => state.agregar)
  const sinStock = producto.stock === 0 || !producto.disponible

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-900">{producto.nombre}</h3>
        <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
          {producto.categoria.nombre}
        </span>
      </div>

      {producto.descripcion && <p className="text-sm text-stone-500 line-clamp-2">{producto.descripcion}</p>}

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-lg font-bold text-stone-900">{formatearMoneda(producto.precio_base)}</span>
        <span className="text-xs text-stone-400">{sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}</span>
      </div>

      <Button disabled={sinStock} onClick={() => agregar(producto)}>
        {sinStock ? 'No disponible' : 'Agregar al carrito'}
      </Button>
    </div>
  )
}
