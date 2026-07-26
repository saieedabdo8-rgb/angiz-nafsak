import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Purchase, Profile, Course, Teacher, Code } from '@/types'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<(Purchase & { student?: Profile; course?: Course; teacher?: Teacher; code?: Code })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('purchases').select('*, student:profiles!student_id(*), course:courses(*), teacher:teachers(*), code:codes(*)')
      .order('purchased_at', { ascending: false })
      .then(({ data }) => {
        setPurchases(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return purchases
    const q = search.trim().toLowerCase()
    return purchases.filter(p =>
      p.student?.full_name?.toLowerCase().includes(q) ||
      p.course?.name?.toLowerCase().includes(q) ||
      p.teacher?.name?.toLowerCase().includes(q) ||
      p.code?.code?.toLowerCase().includes(q)
    )
  }, [purchases, search])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">المشتريات</h1>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا توجد مشتريات</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border,#e2e8f0)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الطالب</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الكورس</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">المدرس</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الكود</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">السعر</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border,#e2e8f0)]">
              {filtered.map((p, i) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-4 text-slate-700 dark:text-slate-300">{p.student?.full_name || '—'}</td>
                  <td className="p-4 text-slate-500">{p.course?.name || '—'}</td>
                  <td className="p-4 text-slate-500">{p.teacher?.name || '—'}</td>
                  <td className="p-4"><span dir="ltr" className="font-mono text-xs text-slate-500">{p.code?.code || '—'}</span></td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(p.price)}</td>
                  <td className="p-4 text-slate-500">{formatDate(p.purchased_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
