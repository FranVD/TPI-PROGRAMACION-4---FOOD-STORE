import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  activarUsuario,
  actualizarCategoria,
  actualizarProducto,
  actualizarStock,
  crearCategoria,
  crearProducto,
  desactivarUsuario,
  eliminarCategoria,
  eliminarProducto,
  listarUsuarios,
  type CategoriaPayload,
  type ProductoPayload,
} from '@/features/admin/api/adminApi'

export function useUsuarios() {
  return useQuery({ queryKey: ['admin', 'usuarios'], queryFn: listarUsuarios })
}

export function useActivarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: activarUsuario,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}

export function useDesactivarUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'usuarios'] }),
  })
}

export function useCrearCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: CategoriaPayload) => crearCategoria(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useActualizarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<CategoriaPayload> }) => actualizarCategoria(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useEliminarCategoria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categorias'] }),
  })
}

export function useCrearProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (datos: ProductoPayload) => crearProducto(datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: Partial<ProductoPayload> }) => actualizarProducto(id, datos),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useActualizarStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible: boolean }) =>
      actualizarStock(id, stock, disponible),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  })
}
