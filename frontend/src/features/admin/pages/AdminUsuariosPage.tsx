import { createColumnHelper } from '@tanstack/react-table'
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from '@/features/admin/hooks/useAdmin'
import { useAuthStore } from '@/store/authStore'
import { DataTable } from '@/shared/ui/DataTable'
import type { Usuario } from '@/shared/api/types'

const columnHelper = createColumnHelper<Usuario>()

export function AdminUsuariosPage() {
  const { data, isLoading } = useUsuarios()
  const activar = useActivarUsuario()
  const desactivar = useDesactivarUsuario()
  const usuarioActual = useAuthStore((state) => state.usuario)

  const columns = [
    columnHelper.accessor('username', { header: 'Usuario' }),
    columnHelper.accessor('full_name', { header: 'Nombre' }),
    columnHelper.accessor('email', { header: 'Email' }),
    columnHelper.accessor('role', { header: 'Rol', cell: (info) => (info.getValue() === 'admin' ? 'Admin' : 'Cliente') }),
    columnHelper.accessor('disabled', {
      header: 'Estado',
      cell: (info) => (
        <span className={info.getValue() ? 'text-stone-400' : 'text-green-700'}>
          {info.getValue() ? 'Desactivado' : 'Activo'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'acciones',
      header: 'Acciones',
      cell: (props) => {
        const usuario = props.row.original
        const esUnoMismo = usuario.id === usuarioActual?.id
        if (esUnoMismo) return <span className="text-stone-400">—</span>
        return usuario.disabled ? (
          <button className="text-amber-700 hover:underline" onClick={() => activar.mutate(usuario.id)}>
            Activar
          </button>
        ) : (
          <button className="text-red-600 hover:underline" onClick={() => desactivar.mutate(usuario.id)}>
            Desactivar
          </button>
        )
      },
    }),
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-stone-900">Usuarios</h1>
      {!isLoading && <DataTable data={data ?? []} columns={columns} emptyMessage="No hay usuarios" />}
    </div>
  )
}
