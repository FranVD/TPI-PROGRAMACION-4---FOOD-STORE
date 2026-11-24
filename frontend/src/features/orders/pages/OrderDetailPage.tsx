import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCancelarPedido, usePedido } from '@/features/orders/hooks/useOrders'
import { EstadoBadge } from '@/shared/ui/EstadoBadge'
import { Button } from '@/shared/ui/Button'
import { MensajeError } from '@/shared/ui/Mensajes'
import { PantallaCargando } from '@/shared/ui/Spinner'
import { formatearFecha, formatearMoneda } from '@/shared/format'
import { getApiErrorMessage } from '@/shared/api/client'

export function OrderDetailPage() {
  const { id } = useParams()
  const pedidoId = Number(id)
  const { data: pedido, isLoading, isError } = usePedido(pedidoId)
  const cancelar = useCancelarPedido()
  const navigate = useNavigate()

  if (isLoading) return <PantallaCargando />
  if (isError || !pedido) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <MensajeError mensaje="No pudimos encontrar ese pedido." />
        <Link to="/mis-pedidos" className="mt-4 inline-block text-amber-700 hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    )
  }

  function handleCancelar() {
    if (!pedido) return
    if (!window.confirm('¿Seguro que querés cancelar este pedido? Se repondrá el stock.')) return
    cancelar.mutate(pedido.id)
  }

  return (
    <div className="mx-auto max-w-lg">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-stone-500 hover:text-stone-800">
        ← Volver
      </button>

      <div className="rounded-lg border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Pedido #{pedido.id}</h1>
          <EstadoBadge estado={pedido.estado} />
        </div>

        <dl className="mb-4 grid grid-cols-2 gap-y-1 text-sm text-stone-600">
          <dt className="text-stone-400">Fecha</dt>
          <dd>{formatearFecha(pedido.created_at)}</dd>
          <dt className="text-stone-400">Forma de pago</dt>
          <dd>{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
          <dt className="text-stone-400">Dirección</dt>
          <dd>{pedido.direccion_entrega}</dd>
          {pedido.notas && (
            <>
              <dt className="text-stone-400">Notas</dt>
              <dd>{pedido.notas}</dd>
            </>
          )}
        </dl>

        <div className="divide-y divide-stone-100 border-t border-stone-200">
          {pedido.items.map((item) => (
            <div key={item.producto_id} className="flex justify-between py-2 text-sm">
              <span>
                {item.cantidad}× {item.nombre_producto}
              </span>
              <span className="text-stone-700">{formatearMoneda(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 flex justify-between border-t border-stone-200 pt-3 font-bold text-stone-900">
          <span>Total</span>
          <span>{formatearMoneda(pedido.total)}</span>
        </div>

        {cancelar.isError && (
          <div className="mt-3">
            <MensajeError mensaje={getApiErrorMessage(cancelar.error, 'No se pudo cancelar el pedido')} />
          </div>
        )}

        {pedido.estado === 'PENDIENTE' && (
          <Button variant="danger" className="mt-4 w-full" onClick={handleCancelar} isLoading={cancelar.isPending}>
            Cancelar pedido
          </Button>
        )}
      </div>
    </div>
  )
}
