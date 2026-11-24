import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-amber-600 text-white hover:bg-amber-700 disabled:bg-amber-300',
  secondary: 'bg-stone-200 text-stone-800 hover:bg-stone-300 disabled:bg-stone-100 disabled:text-stone-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 disabled:text-stone-300',
}

export function Button({ variant = 'primary', isLoading, disabled, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? 'Procesando…' : children}
    </button>
  )
}
