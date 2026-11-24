export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="animate-spin rounded-full border-2 border-stone-300 border-t-amber-600"
      style={{ width: size, height: size }}
    />
  )
}

export function PantallaCargando() {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <Spinner size={36} />
    </div>
  )
}
