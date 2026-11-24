import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Producto } from '@/shared/api/types'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  stock_disponible: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: Producto, cantidad?: number) => void
  quitar: (productoId: number) => void
  actualizarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id)
          if (existente) {
            const nuevaCantidad = Math.min(existente.cantidad + cantidad, producto.stock)
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id ? { ...i, cantidad: nuevaCantidad } : i,
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: Math.min(cantidad, producto.stock),
                stock_disponible: producto.stock,
              },
            ],
          }
        })
      },

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      actualizarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i))
            .filter((i) => i.cantidad > 0),
        })),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: 'food-store-cart' },
  ),
)
