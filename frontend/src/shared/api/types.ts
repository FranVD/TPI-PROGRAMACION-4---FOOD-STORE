// Tipos espejo de los schemas Pydantic/SQLModel del backend.
// Mantener sincronizados con app/modules/*/schemas.py.

export type Role = 'admin' | 'user'

export interface Usuario {
  id: number
  username: string
  full_name: string
  email: string
  role: Role
  disabled: boolean
  created_at: string
}

export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string | null
  precio_base: number
  imagen_url: string | null
  stock: number
  disponible: boolean
  activo: boolean
  categoria: Categoria
}

export interface ProductosPaginados {
  total: number
  items: Producto[]
}

export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'
export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'

export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}

export interface ApiError {
  detail: string
}
