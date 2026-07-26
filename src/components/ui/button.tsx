import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-[var(--button-bg,#3b82f6)] text-[var(--button-text,#ffffff)] hover:opacity-90 shadow-sm',
  primary: 'bg-[var(--primary,#2563eb)] text-white hover:opacity-90 shadow-sm',
  secondary: 'bg-[var(--card,#f8fafc)] text-[var(--text,#0f172a)] border border-[var(--border,#e2e8f0)] hover:bg-[var(--border,#e2e8f0)]',
  outline: 'border border-[var(--border,#e2e8f0)] bg-transparent hover:bg-[var(--card,#f8fafc)] text-[var(--text,#0f172a)]',
  ghost: 'hover:bg-[var(--card,#f8fafc)] text-[var(--text,#0f172a)]',
  danger: 'bg-[var(--danger,#ef4444)] text-white hover:opacity-90',
  success: 'bg-[var(--success,#22c55e)] text-white hover:opacity-90',
  link: 'text-[var(--primary,#2563eb)] underline-offset-4 hover:underline',
}

const sizes = {
  xs: 'h-8 px-3 text-xs rounded-lg',
  sm: 'h-9 px-4 text-sm rounded-xl',
  md: 'h-10 px-5 text-sm rounded-xl',
  lg: 'h-12 px-6 text-base rounded-2xl',
  xl: 'h-14 px-8 text-lg rounded-2xl',
  icon: 'h-10 w-10 rounded-xl',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, loading, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#2563eb)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
