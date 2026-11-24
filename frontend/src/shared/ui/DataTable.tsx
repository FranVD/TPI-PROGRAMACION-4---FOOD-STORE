import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T, any>[]
  emptyMessage?: string
}

export function DataTable<T>({ data, columns, emptyMessage = 'Sin datos' }: DataTableProps<T>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  if (data.length === 0) {
    return <p className="rounded-md border border-dashed border-stone-300 py-8 text-center text-stone-400">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-stone-50 text-left text-stone-500">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 font-medium">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-stone-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-stone-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 text-stone-700">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
