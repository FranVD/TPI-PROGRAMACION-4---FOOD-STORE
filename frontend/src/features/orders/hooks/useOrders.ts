import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cambiarEstadoPedido,
  cancelarPedidoPropio,
  crearPedido,
  listarPedidos,
  obtenerPedido,
  obtenerResumenPedidos,
  type CrearPedidoPayload,
  type ListarPedidosParams,
} from '@/features/orders/api/ordersApi'
import type { EstadoPedido } from '@/shared/api/types'

export function usePedidos(params: ListarPedidosParams) {
  return useQuery({
    queryKey: ['pedidos', params],
    queryFn: () => listarPedidos(params),
    placeholderData: (previousData) => previousData,
  })
}

export function usePedido(id: number) {
  return useQuery({
    queryKey: ['pedidos', id],
    queryFn: () => obtenerPedido(id),
    enabled: Number.isFinite(id),
  })
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ['pedidos', 'resumen'],
    queryFn: obtenerResumenPedidos,
    refetchInterval: 1000 * 30,
  })
}

export function useCrearPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CrearPedidoPayload) => crearPedido(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] }) // el stock cambió
    },
  })
}

export function useCancelarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cancelarPedidoPropio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] })
    },
  })
}
