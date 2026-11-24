import type { InputHTMLAttributes, SelectHTMLAttributes } from 'react'

interface FieldWrapperProps {
  label: string
  error?: string
  children: React.ReactNode
}

function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <FieldWrapper label={label} error={error}>
      <input
        className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${
          error ? 'border-red-400' : 'border-stone-300'
        } ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
}

export function Select({ label, error, className = '', children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} error={error}>
      <select
        className={`rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 ${
          error ? 'border-red-400' : 'border-stone-300'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
