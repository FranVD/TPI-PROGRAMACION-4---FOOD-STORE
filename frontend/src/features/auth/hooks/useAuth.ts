import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { login, logout, obtenerUsuarioActual, registrar, type RegisterPayload } from '@/features/auth/api/authApi'
import { useAuthStore } from '@/store/authStore'

/** Confirma contra el backend si la cookie de sesión sigue siendo válida.
 * Se usa una sola vez al montar la app (ver App.tsx). */
export function useCheckAuth() {
  const setUsuario = useAuthStore((state) => state.setUsuario)
  const clearSession = useAuthStore((state) => state.clearSession)

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const usuario = await obtenerUsuarioActual()
        setUsuario(usuario)
        return usuario
      } catch {
        clearSession()
        return null
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const setUsuario = useAuthStore((state) => state.setUsuario)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => login(username, password),
    onSuccess: async () => {
      const usuario = await obtenerUsuarioActual()
      setUsuario(usuario)
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (datos: RegisterPayload) => registrar(datos),
  })
}

export function useLogout() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession()
      queryClient.clear()
    },
  })
}
