import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'

interface AdminStatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: string; positive: boolean }
  index?: number
}

export function AdminStatCard({ icon: Icon, label, value, trend, index = 0 }: AdminStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative group"
    >
      <div className="relative rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--surface,#ffffff)] p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:border-[var(--border,#e2e8f0)]">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-[var(--primary,#2563eb)]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--primary,#2563eb)]" />
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
              trend.positive
                ? 'bg-[var(--success,#16a34a)]/10 text-[var(--success,#16a34a)]'
                : 'bg-[var(--danger,#dc2626)]/10 text-[var(--danger,#dc2626)]'
            }`}>
              {trend.value}
            </span>
          )}
        </div>
        <p className="text-2xl sm:text-3xl font-semibold text-[var(--text,#0f172a)] tracking-tight">{value}</p>
        <p className="text-sm text-[var(--secondary-text,#64748b)] mt-1">{label}</p>
      </div>
    </motion.div>
  )
}
