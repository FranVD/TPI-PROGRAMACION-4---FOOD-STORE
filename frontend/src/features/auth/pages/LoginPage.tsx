import { useForm } from '@tanstack/react-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useLogin } from '@/features/auth/hooks/useAuth'
import { Button } from '@/shared/ui/Button'
import { MensajeError } from '@/shared/ui/Mensajes'
import { getApiErrorMessage } from '@/shared/api/client'

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const destinoPrevio = (location.state as { from?: string } | null)?.from ?? '/'

  const form = useForm({
    defaultValues: { username: '', password: '' },
    onSubmit: async ({ value }) => {
      await login.mutateAsync(value)
      navigate(destinoPrevio, { replace: true })
    },
  })

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Ingresar</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu usuario' : undefined) }}
        >
          {(field) => (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-stone-700">Usuario</span>
              <input
                className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="username"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-600">{field.state.meta.errors.join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined) }}
        >
          {(field) => (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-stone-700">Contraseña</span>
              <input
                type="password"
                className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                autoComplete="current-password"
              />
              {field.state.meta.errors.length > 0 && (
                <span className="text-xs text-red-600">{field.state.meta.errors.join(', ')}</span>
              )}
            </label>
          )}
        </form.Field>

        {login.isError && (
          <MensajeError mensaje={getApiErrorMessage(login.error, 'Usuario o contraseña incorrectos')} />
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting || login.isPending}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-stone-500">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-amber-700 hover:underline">
          Registrate
        </Link>
      </p>
    </div>
  )
}
