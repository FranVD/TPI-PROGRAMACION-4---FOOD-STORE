import { useEffect, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useCrearPedido } from '@/features/orders/hooks/useOrders'
import { formatearMoneda } from '@/shared/format'
import { Button } from '@/shared/ui/Button'
import { MensajeError } from '@/shared/ui/Mensajes'
import { getApiErrorMessage } from '@/shared/api/client'
import type { FormaPago } from '@/shared/api/types'

export function CheckoutPage() {
  const { items, total, vaciar } = useCartStore()
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()
  // Evita que el guard de "carrito vacío" compita con la navegación al pedido
  // recién creado: vaciar() dispara un re-render antes de que navigate()
  // termine de cambiar de ruta, y sin esta bandera ambos efectos navegan a
  // destinos distintos.
  const pedidoCreadoRef = useRef(false)

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: 'EFECTIVO' as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: value.forma_pago,
        direccion_entrega: value.direccion_entrega,
        notas: value.notas || undefined,
      })
      pedidoCreadoRef.current = true
      navigate(`/mis-pedidos/${pedido.id}`)
      vaciar()
    },
  })

  // El redirect a /carrito va en un efecto (no en el cuerpo del render) para
  // no competir con la navegación de arriba.
  useEffect(() => {
    if (items.length === 0 && !pedidoCreadoRef.current) {
      navigate('/carrito', { replace: true })
    }
  }, [items.length, navigate])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Finalizar pedido</h1>

      <div className="mb-6 rounded-lg border border-stone-200 bg-white p-4">
        <h2 className="mb-2 font-semibold text-stone-900">Resumen</h2>
        {items.map((item) => (
          <div key={item.producto_id} className="flex justify-between text-sm text-stone-600">
            <span>
              {item.cantidad}× {item.nombre}
            </span>
            <span>{formatearMoneda(item.precio_unitario * item.cantidad)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
          <span>Total</span>
          <span>{formatearMoneda(total())}</span>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="direccion_entrega"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 5 ? 'La dirección debe tener al menos 5 caracteres' : undefined,
          }}
        >
          {(field) => (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-stone-700">Dirección de entrega</span>
              <input
                className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Calle, número, piso/depto"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-600">{field.state.meta.errors.join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field name="forma_pago">
          {(field) => (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-stone-700">Forma de pago</span>
              <select
                className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value as FormaPago)}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </label>
          )}
        </form.Field>

        <form.Field name="notas">
          {(field) => (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-stone-700">Notas (opcional)</span>
              <textarea
                className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={2}
              />
            </label>
          )}
        </form.Field>

        {crearPedido.isError && (
          <MensajeError mensaje={getApiErrorMessage(crearPedido.error, 'No se pudo generar el pedido')} />
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting || crearPedido.isPending}>
              Confirmar pedido
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  )
}
