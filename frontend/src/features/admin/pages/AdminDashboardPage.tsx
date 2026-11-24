import { useResumenPedidos } from '@/features/orders/hooks/useOrders'
import { formatearMoneda } from '@/shared/format'
import { PantallaCargando } from '@/shared/ui/Spinner'

export function AdminDashboardPage() {
  const { data, isLoading } = useResumenPedidos()

  if (isLoading || !data) return <PantallaCargando />

  const tarjetas = [
    { label: 'Pendientes', valor: data.pendientes, color: 'bg-amber-50 text-amber-700' },
    { label: 'En preparación', valor: data.en_preparacion, color: 'bg-blue-50 text-blue-700' },
    { label: 'Entregados', valor: data.entregados, color: 'bg-green-50 text-green-700' },
    { label: 'Cancelados', valor: data.cancelados, color: 'bg-stone-100 text-stone-600' },
    { label: 'Pedidos hoy', valor: data.pedidos_hoy, color: 'bg-stone-50 text-stone-700' },
    {
      label: 'Ingresos (entregados)',
      valor: formatearMoneda(data.ingresos_entregados),
      color: 'bg-emerald-50 text-emerald-700',
    },
  ]

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Resumen</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <div key={t.label} className={`rounded-lg p-4 ${t.color}`}>
            <p className="text-sm font-medium opacity-80">{t.label}</p>
            <p className="text-2xl font-bold">{t.valor}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
