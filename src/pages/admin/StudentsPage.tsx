import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2, ShoppingBag, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getMyOrders, getMyPurchases } from '@/api/queries'
import type { Profile, Order, Purchase, Course, Teacher, Code } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils'

const orderStatusLabels: Record<string, string> = {
  pending: 'معلق',
  approved: 'تم الدفع',
  rejected: 'مرفوض',
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [orders, setOrders] = useState<(Order & { course?: Course; teacher?: Teacher })[]>([])
  const [purchases, setPurchases] = useState<(Purchase & { course?: Course; teacher?: Teacher; code?: Code })[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false })
      .then(({ data }) => {
        setStudents(data ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return students
    const q = search.trim().toLowerCase()
    return students.filter(s =>
      s.full_name?.toLowerCase().includes(q) ||
      s.phone?.includes(q)
    )
  }, [students, search])

  async function toggleExpand(studentId: string) {
    if (expandedId === studentId) {
      setExpandedId(null)
      return
    }
    setExpandedId(studentId)
    setDetailsLoading(true)
    const [ordersData, purchasesData] = await Promise.all([
      getMyOrders(studentId),
      getMyPurchases(studentId),
    ])
    setOrders(ordersData)
    setPurchases(purchasesData)
    setDetailsLoading(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الطلاب</h1>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو رقم الهاتف..." className="pr-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا يوجد طلاب</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student, i) => (
            <motion.div key={student.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center text-white text-sm font-bold">
                      {student.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{student.full_name}</p>
                      <p className="text-xs text-slate-400">{student.phone}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(student.id)}>
                      {expandedId === student.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {expandedId === student.id ? 'إخفاء' : 'عرض التفاصيل'}
                    </Button>
                  </div>

                  {expandedId === student.id && (
                    <div className="mt-4 pt-4 border-t border-[var(--border,#e2e8f0)]">
                      {detailsLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary,#2563eb)]" /></div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Orders */}
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              <ClipboardList className="w-4 h-4" />الطلبات
                            </h4>
                            {orders.length === 0 ? (
                              <p className="text-sm text-slate-400">لا توجد طلبات</p>
                            ) : (
                              <div className="space-y-2">
                                {orders.map(order => (
                                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-slate-700 dark:text-slate-300 truncate">{order.course?.name || '—'}</p>
                                      <p className="text-xs text-slate-400">{order.teacher?.name} • {formatDate(order.created_at)}</p>
                                    </div>
                                    <div className="flex items-center gap-3 mr-3">
                                      <span className="text-sm font-medium">{formatCurrency(order.price)}</span>
                                      <Badge variant={order.payment_status === 'approved' ? 'success' : order.payment_status === 'pending' ? 'warning' : 'danger'}>
                                        {orderStatusLabels[order.payment_status]}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Purchases */}
                          <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              <ShoppingBag className="w-4 h-4" />المشتريات
                            </h4>
                            {purchases.length === 0 ? (
                              <p className="text-sm text-slate-400">لا توجد مشتريات</p>
                            ) : (
                              <div className="space-y-2">
                                {purchases.map(p => (
                                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-sm">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-slate-700 dark:text-slate-300 truncate">{p.course?.name || '—'}</p>
                                      <p className="text-xs text-slate-400">{p.teacher?.name} • {p.code?.code || '—'}</p>
                                    </div>
                                    <span className="text-sm font-medium mr-3">{formatCurrency(p.price)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
