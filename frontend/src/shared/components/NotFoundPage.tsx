import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold text-stone-900">Página no encontrada</h1>
      <Link to="/" className="font-medium text-amber-700 hover:underline">
        Volver al catálogo
      </Link>
    </div>
  )
}
