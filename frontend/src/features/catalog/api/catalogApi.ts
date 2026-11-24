import { apiClient } from '@/shared/api/client'
import type { Categoria, ProductosPaginados } from '@/shared/api/types'

export interface ListarProductosParams {
  skip?: number
  limit?: number
  search?: string
  categoria_id?: number
  disponible?: boolean
}

export async function listarProductos(params: ListarProductosParams): Promise<ProductosPaginados> {
  const { data } = await apiClient.get<ProductosPaginados>('/productos', { params })
  return data
}

export async function listarCategorias(): Promise<Categoria[]> {
  const { data } = await apiClient.get<Categoria[]>('/categorias')
  return data
}
