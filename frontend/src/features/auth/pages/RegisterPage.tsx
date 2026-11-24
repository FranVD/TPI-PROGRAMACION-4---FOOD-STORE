import { useForm } from '@tanstack/react-form'
import { Link, useNavigate } from 'react-router-dom'
import { useRegister } from '@/features/auth/hooks/useAuth'
import { Button } from '@/shared/ui/Button'
import { MensajeError } from '@/shared/ui/Mensajes'
import { getApiErrorMessage } from '@/shared/api/client'

interface CampoProps {
  label: string
  name: string
  type?: string
  autoComplete?: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  errors: unknown[]
}

function Campo({ label, name, type = 'text', autoComplete, value, onChange, onBlur, errors }: CampoProps) {
  const mensajes = errors.filter((e): e is string => typeof e === 'string')
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {mensajes.length > 0 && <span className="text-xs text-red-600">{mensajes.join(', ')}</span>}
    </label>
  )
}

export function RegisterPage() {
  const register = useRegister()
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '' },
    onSubmit: async ({ value }) => {
      await register.mutateAsync(value)
      navigate('/login', { state: { registrado: true } })
    },
  })

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold text-stone-900">Crear cuenta</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="full_name"
          validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu nombre completo' : undefined) }}
        >
          {(field) => (
            <Campo
              label="Nombre completo"
              name="full_name"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errors={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => (value.length < 3 ? 'Mínimo 3 caracteres' : undefined),
          }}
        >
          {(field) => (
            <Campo
              label="Usuario"
              name="username"
              autoComplete="username"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errors={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (!value.includes('@') ? 'Ingresá un email válido' : undefined),
          }}
        >
          {(field) => (
            <Campo
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errors={field.state.meta.errors}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => (value.length < 8 ? 'Mínimo 8 caracteres' : undefined),
          }}
        >
          {(field) => (
            <Campo
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              errors={field.state.meta.errors}
            />
          )}
        </form.Field>

        {register.isError && (
          <MensajeError mensaje={getApiErrorMessage(register.error, 'No se pudo crear la cuenta')} />
        )}

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit} isLoading={isSubmitting || register.isPending}>
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-4 text-center text-sm text-stone-500">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-amber-700 hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  )
}
