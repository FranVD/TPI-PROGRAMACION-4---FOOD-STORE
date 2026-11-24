import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  withCredentials: true, // manda/recibe la cookie HttpOnly access_token
})

// Si el backend responde 401 fuera de /auth/token y /auth/me (esas dos rutas
// devuelven 401 como parte de su flujo normal: credenciales inválidas o "no
// hay sesión" al chequear /auth/me al montar la app, no una sesión vencida a
// mitad de uso), o 400 con "Cuenta de usuario desactivada" (un admin
// desactivó al usuario mientras tenía la sesión abierta), limpiamos el
// authStore. La vuelta a /login la hace el propio ProtectedRoute al quedar
// sin usuario.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? ''
    const esLoginOMe = url.includes('/auth/token') || url.includes('/auth/me')
    const esCuentaDesactivada =
      error.response?.status === 400 && error.response?.data?.detail === 'Cuenta de usuario desactivada'

    if ((error.response?.status === 401 && !esLoginOMe) || esCuentaDesactivada) {
      useAuthStore.getState().clearSession()
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.detail === 'string') {
    return error.response.data.detail
  }
  return fallback
}
