import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { createColumnHelper } from '@tanstack/react-table'
import { useCategorias, useProductos } from '@/features/catalog/hooks/useCatalog'
import { useActualizarProducto, useCrearProducto, useEliminarProducto } from '@/features/admin/hooks/useAdmin'
import { DataTable } from '@/shared/ui/DataTable'
import { Button } from '@/shared/ui/Button'
import { MensajeError } from '@/shared/ui/Mensajes'
import { getApiErrorMessage } from '@/shared/api/client'
import { formatearMoneda } from '@/shared/format'
import type { Categoria, Producto } from '@/shared/api/types'

const columnHelper = createColumnHelper<Producto>()

interface ProductoFormValues {
  categoria_id: string
  nombre: string
  descripcion: string
  precio_base: string
  stock: string
  disponible: boolean
}

interface ProductoFormProps {
  valoresIniciales: ProductoFormValues
  categorias: Categoria[]
  enEdicion: boolean
  isPending: boolean
  onSubmit: (valores: ProductoFormValues) => void
  onCancelar: () => void
}

function ProductoForm({ valoresIniciales, categorias, enEdicion, isPending, onSubmit, onCancelar }: ProductoFormProps) {
  const form = useForm({
    defaultValues: valoresIniciales,
    onSubmit: ({ value }) => onSubmit(value),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="grid grid-cols-1 gap-3 rounded-lg border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim().length < 1 ? 'Ingresá un nombre' : undefined) }}
      >
        {(field) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Nombre</span>
            <input
              name="nombre"
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <span className="text-xs text-red-600">{field.state.meta.errors.join(', ')}</span>
            )}
          </label>
        )}
      </form.Field>

      <form.Field
        name="categoria_id"
        validators={{ onChange: ({ value }) => (!value ? 'Elegí una categoría' : undefined) }}
      >
        {(field) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Categoría</span>
            <select
              name="categoria_id"
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            >
              <option value="" disabled>
                Seleccionar…
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
      </form.Field>

      <form.Field
        name="precio_base"
        validators={{ onChange: ({ value }) => (Number(value) < 0 || value === '' ? 'Precio inválido' : undefined) }}
      >
        {(field) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Precio</span>
            <input
              name="precio_base"
              type="number"
              min={0}
              step="0.01"
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </label>
        )}
      </form.Field>

      <form.Field
        name="stock"
        validators={{ onChange: ({ value }) => (Number(value) < 0 || value === '' ? 'Stock inválido' : undefined) }}
      >
        {(field) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Stock</span>
            <input
              name="stock"
              type="number"
              min={0}
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </label>
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Descripción</span>
            <input
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </label>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <div className="flex gap-2 sm:col-span-2 lg:col-span-3">
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting || isPending}>
              {enEdicion ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          )}
        </form.Subscribe>
        {enEdicion && (
          <Button type="button" variant="secondary" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

export function AdminProductosPage() {
  const { data, isLoading } = useProductos({ limit: 100 })
  const { data: categorias } = useCategorias()
  const crear = useCrearProducto()
  const actualizar = useActualizarProducto()
  const eliminar = useEliminarProducto()

  const [editando, setEditando] = useState<Producto | null>(null)
  const mutacionActiva = editando ? actualizar : crear

  function handleSubmit(valores: ProductoFormValues) {
    const datos = {
      categoria_id: Number(valores.categoria_id),
      nombre: valores.nombre,
      descripcion: valores.descripcion || null,
      precio_base: Number(valores.precio_base),
      stock: Number(valores.stock),
      disponible: valores.disponible,
    }
    if (editando) {
      actualizar.mutate({ id: editando.id, datos }, { onSuccess: () => setEditando(null) })
    } else {
      crear.mutate(datos)
    }
  }

  function handleEliminar(id: number) {
    if (!window.confirm('¿Eliminar este producto?')) return
    eliminar.mutate(id)
  }

  const columns = [
    columnHelper.accessor('nombre', { header: 'Nombre' }),
    columnHelper.accessor((row) => row.categoria.nombre, { id: 'categoria', header: 'Categoría' }),
    columnHelper.accessor('precio_base', { header: 'Precio', cell: (info) => formatearMoneda(info.getValue()) }),
    columnHelper.accessor('stock', { header: 'Stock' }),
    columnHelper.accessor('disponible', { header: 'Disponible', cell: (info) => (info.getValue() ? 'Sí' : 'No') }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (props) => (
        <div className="flex gap-2">
          <button className="text-amber-700 hover:underline" onClick={() => setEditando(props.row.original)}>
            Editar
          </button>
          <button className="text-red-600 hover:underline" onClick={() => handleEliminar(props.row.original.id)}>
            Eliminar
          </button>
        </div>
      ),
    }),
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-stone-900">Productos</h1>

      <ProductoForm
        key={editando?.id ?? 'new'}
        categorias={categorias ?? []}
        valoresIniciales={{
          categoria_id: editando ? String(editando.categoria.id) : '',
          nombre: editando?.nombre ?? '',
          descripcion: editando?.descripcion ?? '',
          precio_base: editando ? String(editando.precio_base) : '',
          stock: editando ? String(editando.stock) : '',
          disponible: editando?.disponible ?? true,
        }}
        enEdicion={editando !== null}
        isPending={mutacionActiva.isPending}
        onSubmit={handleSubmit}
        onCancelar={() => setEditando(null)}
      />

      {mutacionActiva.isError && (
        <MensajeError mensaje={getApiErrorMessage(mutacionActiva.error, 'No se pudo guardar el producto')} />
      )}

      {!isLoading && <DataTable data={data?.items ?? []} columns={columns} emptyMessage="No hay productos creados" />}
    </div>
  )
}
