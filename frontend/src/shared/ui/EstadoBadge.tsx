import type { EstadoPedido } from '@/shared/api/types'

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-stone-200 text-stone-600',
}

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${estilos[estado]}`}>
      {etiquetas[estado]}
    </span>
  )
}
