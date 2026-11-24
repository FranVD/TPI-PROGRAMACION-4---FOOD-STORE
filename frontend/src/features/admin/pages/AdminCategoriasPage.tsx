import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { createColumnHelper } from '@tanstack/react-table'
import { useCategorias } from '@/features/catalog/hooks/useCatalog'
import { useActualizarCategoria, useCrearCategoria, useEliminarCategoria } from '@/features/admin/hooks/useAdmin'
import { DataTable } from '@/shared/ui/DataTable'
import { Button } from '@/shared/ui/Button'
import { MensajeError } from '@/shared/ui/Mensajes'
import { getApiErrorMessage } from '@/shared/api/client'
import type { Categoria } from '@/shared/api/types'

const columnHelper = createColumnHelper<Categoria>()

interface CategoriaFormValues {
  nombre: string
  descripcion: string
}

interface CategoriaFormProps {
  valoresIniciales: CategoriaFormValues
  enEdicion: boolean
  isPending: boolean
  onSubmit: (valores: CategoriaFormValues) => void
  onCancelar: () => void
}

// Componente separado y montado con `key` (ver más abajo) para que
// defaultValues se recapture al pasar de "crear" a "editar": TanStack Form
// toma los defaultValues una sola vez, al montar.
function CategoriaForm({ valoresIniciales, enEdicion, isPending, onSubmit, onCancelar }: CategoriaFormProps) {
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
      className="flex flex-wrap items-end gap-3 rounded-lg border border-stone-200 bg-white p-4"
    >
      <form.Field
        name="nombre"
        validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
      >
        {(field) => (
          <label className="flex min-w-[180px] flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Nombre</span>
            <input
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

      <form.Field name="descripcion">
        {(field) => (
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm">
            <span className="font-medium text-stone-700">Descripción</span>
            <input
              className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting || isPending}>
            {enEdicion ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        )}
      </form.Subscribe>

      {enEdicion && (
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
      )}
    </form>
  )
}

export function AdminCategoriasPage() {
  const { data: categorias, isLoading } = useCategorias()
  const crear = useCrearCategoria()
  const actualizar = useActualizarCategoria()
  const eliminar = useEliminarCategoria()

  const [editando, setEditando] = useState<Categoria | null>(null)
  const mutacionActiva = editando ? actualizar : crear

  function handleSubmit(valores: CategoriaFormValues) {
    const datos = { nombre: valores.nombre, descripcion: valores.descripcion || null }
    if (editando) {
      actualizar.mutate({ id: editando.id, datos }, { onSuccess: () => setEditando(null) })
    } else {
      crear.mutate(datos)
    }
  }

  function handleEliminar(id: number) {
    if (!window.confirm('¿Eliminar esta categoría? Los productos ya cargados no se ven afectados.')) return
    eliminar.mutate(id)
  }

  const columns = [
    columnHelper.accessor('nombre', { header: 'Nombre' }),
    columnHelper.accessor('descripcion', { header: 'Descripción', cell: (info) => info.getValue() ?? '—' }),
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
      <h1 className="text-2xl font-bold text-stone-900">Categorías</h1>

      <CategoriaForm
        key={editando?.id ?? 'new'}
        valoresIniciales={{ nombre: editando?.nombre ?? '', descripcion: editando?.descripcion ?? '' }}
        enEdicion={editando !== null}
        isPending={mutacionActiva.isPending}
        onSubmit={handleSubmit}
        onCancelar={() => setEditando(null)}
      />

      {mutacionActiva.isError && (
        <MensajeError mensaje={getApiErrorMessage(mutacionActiva.error, 'No se pudo guardar la categoría')} />
      )}

      {!isLoading && <DataTable data={categorias ?? []} columns={columns} emptyMessage="No hay categorías creadas" />}
    </div>
  )
}
