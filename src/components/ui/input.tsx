import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          'flex h-11 w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-4 py-2 text-sm text-[var(--text,#0f172a)] placeholder:text-[var(--text,#0f172a)]/40 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary,#2563eb)] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-[var(--danger,#ef4444)] focus-visible:ring-[var(--danger,#ef4444)]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[var(--danger,#ef4444)]">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export { Input }
export type { InputProps }
