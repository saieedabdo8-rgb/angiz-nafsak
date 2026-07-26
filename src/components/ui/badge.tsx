import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-[var(--primary,#2563eb)]/10 text-[var(--primary,#2563eb)] border-transparent',
  success: 'bg-[var(--success,#22c55e)]/10 text-[var(--success,#22c55e)] border-transparent',
  warning: 'bg-[var(--warning,#f59e0b)]/10 text-[var(--warning,#f59e0b)] border-transparent',
  danger: 'bg-[var(--danger,#ef4444)]/10 text-[var(--danger,#ef4444)] border-transparent',
  secondary: 'bg-[var(--card,#f8fafc)] text-[var(--text,#0f172a)] border-[var(--border,#e2e8f0)]',
  outline: 'border-[var(--border,#e2e8f0)] text-[var(--text,#0f172a)]',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
)
Badge.displayName = 'Badge'

export { Badge }
