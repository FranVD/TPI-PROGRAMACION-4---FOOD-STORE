import { useState } from 'react'
import { useCategorias, useProductos } from '@/features/catalog/hooks/useCatalog'
import { ProductCard } from '@/features/catalog/components/ProductCard'
import { ProductCardSkeleton } from '@/features/catalog/components/ProductCardSkeleton'
import { Select } from '@/shared/ui/Input'
import { Button } from '@/shared/ui/Button'
import { EstadoVacio } from '@/shared/ui/Mensajes'

const LIMITE_POR_PAGINA = 9

export function CatalogPage() {
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | ''>('')
  const [page, setPage] = useState(0)

  const { data: categorias } = useCategorias()
  const { data, isLoading, isFetching } = useProductos({
    skip: page * LIMITE_POR_PAGINA,
    limit: LIMITE_POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId === '' ? undefined : categoriaId,
  })

  const totalPaginas = data ? Math.max(1, Math.ceil(data.total / LIMITE_POR_PAGINA)) : 1

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    setPage(0)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Catálogo</h1>
        <p className="text-stone-500">Elegí tus productos favoritos y armá tu pedido.</p>
      </div>

      <form onSubmit={handleBuscar} className="flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Buscar</span>
            <input
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Nombre del producto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        <Select
          label="Categoría"
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value === '' ? '' : Number(e.target.value))
            setPage(0)
          }}
        >
          <option value="">Todas</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>

        <Button type="submit" variant="secondary">
          Buscar
        </Button>
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: LIMITE_POR_PAGINA }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio titulo="No encontramos productos" descripcion="Probá con otra búsqueda o categoría." />
      ) : (
        <>
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''}`}>
            {data.items.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                ← Anterior
              </Button>
              <span className="text-sm text-stone-500">
                Página {page + 1} de {totalPaginas}
              </span>
              <Button
                variant="secondary"
                disabled={page + 1 >= totalPaginas}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
