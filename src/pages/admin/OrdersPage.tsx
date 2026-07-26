import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, Filter } from 'lucide-react'
import { getAllOrders } from '@/api/queries'
import type { Order, Profile, Course, Teacher } from '@/types'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

const statusLabels: Record<string, string> = {
  pending: 'معلق',
  approved: 'تم الدفع',
  rejected: 'مرفوض',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<(Order & { student?: Profile; course?: Course; teacher?: Teacher })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    getAllOrders().then(data => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let result = orders
    if (statusFilter !== 'all') result = result.filter(o => o.payment_status === statusFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(o =>
        o.student?.full_name?.toLowerCase().includes(q) ||
        o.course?.name?.toLowerCase().includes(q) ||
        o.teacher?.name?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      )
    }
    return result
  }, [orders, search, statusFilter])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الطلبات</h1>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-3 text-sm text-[var(--text,#0f172a)]">
            <option value="all">الكل</option>
            <option value="pending">معلق</option>
            <option value="approved">تم الدفع</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border,#e2e8f0)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الطالب</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الكورس</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">المدرس</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">السعر</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الحالة</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border,#e2e8f0)]">
              {filtered.map((order, i) => (
                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-4">
                    <span className="text-slate-700 dark:text-slate-300">{order.student?.full_name || '—'}</span>
                  </td>
                  <td className="p-4 text-slate-500">{order.course?.name || '—'}</td>
                  <td className="p-4 text-slate-500">{order.teacher?.name || '—'}</td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(order.price)}</td>
                  <td className="p-4"><Badge variant={statusColors[order.payment_status]}>{statusLabels[order.payment_status]}</Badge></td>
                  <td className="p-4 text-slate-500">{formatDate(order.created_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
