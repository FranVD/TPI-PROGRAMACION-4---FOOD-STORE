import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePedidos } from '@/features/orders/hooks/useOrders'
import { EstadoBadge } from '@/shared/ui/EstadoBadge'
import { EstadoVacio } from '@/shared/ui/Mensajes'
import { Select } from '@/shared/ui/Input'
import { Spinner } from '@/shared/ui/Spinner'
import { formatearFecha, formatearMoneda } from '@/shared/format'
import type { EstadoPedido } from '@/shared/api/types'

export function MyOrdersPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const { data, isLoading } = usePedidos({ estado: estado || undefined, limit: 50 })

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>
        <Select label="" value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}>
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={32} />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio titulo="Todavía no hiciste ningún pedido" />
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.map((pedido) => (
            <Link
              key={pedido.id}
              to={`/mis-pedidos/${pedido.id}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 hover:border-amber-400"
            >
              <div>
                <p className="font-medium text-stone-900">Pedido #{pedido.id}</p>
                <p className="text-sm text-stone-500">{formatearFecha(pedido.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-stone-900">{formatearMoneda(pedido.total)}</span>
                <EstadoBadge estado={pedido.estado} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
