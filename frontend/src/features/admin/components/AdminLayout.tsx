import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
]

export function AdminLayout() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <aside className="flex shrink-0 flex-row gap-1 overflow-x-auto sm:w-48 sm:flex-col">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-100'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </aside>

      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  )
}
