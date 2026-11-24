import { useQuery } from '@tanstack/react-query'
import { listarCategorias, listarProductos, type ListarProductosParams } from '@/features/catalog/api/catalogApi'

export function useProductos(params: ListarProductosParams) {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: () => listarProductos(params),
    placeholderData: (previousData) => previousData, // evita parpadeo al cambiar de página/filtro
  })
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
    staleTime: 1000 * 60 * 5,
  })
}
