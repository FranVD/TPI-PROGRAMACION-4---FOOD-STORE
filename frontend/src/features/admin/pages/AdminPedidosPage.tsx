import { useState } from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { useCambiarEstadoPedido, usePedidos } from '@/features/orders/hooks/useOrders'
import { DataTable } from '@/shared/ui/DataTable'
import { EstadoBadge } from '@/shared/ui/EstadoBadge'
import { Select } from '@/shared/ui/Input'
import { formatearFecha, formatearMoneda } from '@/shared/format'
import type { EstadoPedido, Pedido } from '@/shared/api/types'

// Espejo de TRANSICIONES del backend (app/modules/pedidos/service.py), solo
// para decidir qué botones mostrar; la validación real la hace el backend.
const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Marcar en preparación',
  ENTREGADO: 'Marcar entregado',
  CANCELADO: 'Cancelar',
}

const columnHelper = createColumnHelper<Pedido>()

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | ''>('')
  const { data, isLoading } = usePedidos({ estado: estado || undefined, limit: 100 })
  const cambiarEstado = useCambiarEstadoPedido()

  const columns = [
    columnHelper.accessor('id', { header: '#' }),
    columnHelper.accessor('created_at', { header: 'Fecha', cell: (info) => formatearFecha(info.getValue()) }),
    columnHelper.accessor('total', { header: 'Total', cell: (info) => formatearMoneda(info.getValue()) }),
    columnHelper.accessor('estado', { header: 'Estado', cell: (info) => <EstadoBadge estado={info.getValue()} /> }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (props) => {
        const pedido = props.row.original
        const siguientes = TRANSICIONES[pedido.estado]
        if (siguientes.length === 0) return <span className="text-stone-400">—</span>
        return (
          <div className="flex gap-2">
            {siguientes.map((siguiente) => (
              <button
                key={siguiente}
                disabled={cambiarEstado.isPending}
                className={siguiente === 'CANCELADO' ? 'text-red-600 hover:underline' : 'text-amber-700 hover:underline'}
                onClick={() => cambiarEstado.mutate({ id: pedido.id, estado: siguiente })}
              >
                {etiquetas[siguiente]}
              </button>
            ))}
          </div>
        )
      },
    }),
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900">Pedidos</h1>
        <Select label="" value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | '')}>
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </Select>
      </div>

      {!isLoading && <DataTable data={data?.items ?? []} columns={columns} emptyMessage="No hay pedidos" />}
    </div>
  )
}
