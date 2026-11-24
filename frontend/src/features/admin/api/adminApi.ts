import { apiClient } from '@/shared/api/client'
import type { Categoria, Producto, Usuario } from '@/shared/api/types'

// --- Categorías ---
export interface CategoriaPayload {
  nombre: string
  descripcion?: string | null
}

export async function crearCategoria(datos: CategoriaPayload): Promise<Categoria> {
  const { data } = await apiClient.post<Categoria>('/categorias', datos)
  return data
}

export async function actualizarCategoria(id: number, datos: Partial<CategoriaPayload>): Promise<Categoria> {
  const { data } = await apiClient.put<Categoria>(`/categorias/${id}`, datos)
  return data
}

export async function eliminarCategoria(id: number): Promise<void> {
  await apiClient.delete(`/categorias/${id}`)
}

// --- Productos ---
export interface ProductoPayload {
  categoria_id: number
  nombre: string
  descripcion?: string | null
  precio_base: number
  imagen_url?: string | null
  stock: number
  disponible: boolean
}

export async function crearProducto(datos: ProductoPayload): Promise<Producto> {
  const { data } = await apiClient.post<Producto>('/productos', datos)
  return data
}

export async function actualizarProducto(id: number, datos: Partial<ProductoPayload>): Promise<Producto> {
  const { data } = await apiClient.put<Producto>(`/productos/${id}`, datos)
  return data
}

export async function actualizarStock(id: number, stock: number, disponible: boolean): Promise<Producto> {
  const { data } = await apiClient.patch<Producto>(`/productos/${id}/stock`, { stock, disponible })
  return data
}

export async function eliminarProducto(id: number): Promise<void> {
  await apiClient.delete(`/productos/${id}`)
}

// --- Usuarios ---
export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await apiClient.get<Usuario[]>('/admin/usuarios')
  return data
}

export async function activarUsuario(id: number): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>(`/admin/usuarios/${id}/activar`)
  return data
}

export async function desactivarUsuario(id: number): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>(`/admin/usuarios/${id}/desactivar`)
  return data
}
