import { apiClient } from '@/shared/api/client'
import type { EstadoPedido, FormaPago, Pedido, PedidosPaginados, ResumenPedidos } from '@/shared/api/types'

export interface CrearPedidoPayload {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas?: string
}

export async function crearPedido(datos: CrearPedidoPayload): Promise<Pedido> {
  const { data } = await apiClient.post<Pedido>('/pedidos', datos)
  return data
}

export interface ListarPedidosParams {
  skip?: number
  limit?: number
  estado?: EstadoPedido
}

export async function listarPedidos(params: ListarPedidosParams): Promise<PedidosPaginados> {
  const { data } = await apiClient.get<PedidosPaginados>('/pedidos', { params })
  return data
}

export async function obtenerPedido(id: number): Promise<Pedido> {
  const { data } = await apiClient.get<Pedido>(`/pedidos/${id}`)
  return data
}

export async function cancelarPedidoPropio(id: number): Promise<Pedido> {
  const { data } = await apiClient.patch<Pedido>(`/pedidos/${id}/cancelar`)
  return data
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await apiClient.patch<Pedido>(`/pedidos/${id}/estado`, { estado })
  return data
}

export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await apiClient.get<ResumenPedidos>('/pedidos/resumen')
  return data
}
