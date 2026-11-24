import { apiClient } from '@/shared/api/client'
import type { Usuario } from '@/shared/api/types'

export interface RegisterPayload {
  username: string
  full_name: string
  email: string
  password: string
}

export async function registrar(datos: RegisterPayload): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>('/auth/register', datos)
  return data
}

export async function login(username: string, password: string): Promise<void> {
  const form = new URLSearchParams()
  form.set('username', username)
  form.set('password', password)
  await apiClient.post('/auth/token', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}

export async function obtenerUsuarioActual(): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>('/auth/me')
  return data
}
