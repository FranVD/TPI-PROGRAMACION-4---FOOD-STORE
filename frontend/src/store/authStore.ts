import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/shared/api/types'

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  isChecking: boolean
  setUsuario: (usuario: Usuario) => void
  clearSession: () => void
  setChecking: (checking: boolean) => void
}

// La sesión real vive en la cookie HttpOnly (el JS nunca la toca). Este store
// solo cachea el usuario para no mostrar pantallas en blanco mientras se
// resuelve /auth/me en el primer render; isAuthenticated se reconfirma con
// el backend en cada carga de la app (ver App.tsx / checkAuth).
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      isAuthenticated: false,
      isChecking: true,
      setUsuario: (usuario) => set({ usuario, isAuthenticated: true, isChecking: false }),
      clearSession: () => set({ usuario: null, isAuthenticated: false, isChecking: false }),
      setChecking: (checking) => set({ isChecking: checking }),
    }),
    {
      name: 'food-store-auth',
      partialize: (state) => ({ usuario: state.usuario, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

export const useUsuarioActual = () => useAuthStore((state) => state.usuario)
export const useEsAdmin = () => useAuthStore((state) => state.usuario?.role === 'admin')
