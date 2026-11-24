export function MensajeError({ mensaje }: { mensaje: string }) {
  return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{mensaje}</p>
}

export function EstadoVacio({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-dashed border-stone-300 py-12 text-center">
      <p className="font-medium text-stone-600">{titulo}</p>
      {descripcion && <p className="text-sm text-stone-400">{descripcion}</p>}
    </div>
  )
}
