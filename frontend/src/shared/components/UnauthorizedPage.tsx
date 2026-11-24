import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-2xl font-bold text-stone-900">No tenés acceso a esta página</h1>
      <p className="text-stone-500">Esta sección es solo para administradores.</p>
      <Link to="/" className="font-medium text-amber-700 hover:underline">
        Volver al catálogo
      </Link>
    </div>
  )
}
