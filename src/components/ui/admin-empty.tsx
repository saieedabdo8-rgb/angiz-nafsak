import { type LucideIcon } from 'lucide-react'
import { Button } from './button'

interface AdminEmptyProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function AdminEmpty({ icon: Icon, title, description, action }: AdminEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary,#2563eb)]/5 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-[var(--primary,#2563eb)]/40" />
        </div>
      )}
      <p className="text-lg font-medium text-[var(--text,#0f172a)]">{title}</p>
      {description && <p className="text-sm text-[var(--secondary-text,#64748b)] mt-1 mb-6">{description}</p>}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  )
}
