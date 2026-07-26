import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShoppingBag, Copy, Check, GraduationCap } from 'lucide-react'
import { getMyPurchases } from '@/api/queries'
import { useAuth } from '@/contexts/AuthContext'
import type { Purchase } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Purchases() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    getMyPurchases(user.id).then(data => {
      setPurchases(data)
      setLoading(false)
    })
  }, [user])

  const filtered = purchases.filter(p => {
    const q = searchQuery.toLowerCase()
    return (
      p.course?.name?.toLowerCase().includes(q) ||
      p.teacher?.name?.toLowerCase().includes(q) ||
      p.code?.code?.toLowerCase().includes(q)
    )
  })

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success('تم نسخ الكود')
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-16 h-16 text-[var(--text,#0f172a)]/20 mx-auto mb-4" />
        <p className="text-lg text-[var(--text,#0f172a)]/40 mb-4">يجب تسجيل الدخول لعرض المشتريات</p>
        <Button variant="primary" asChild><Link to="/login">تسجيل الدخول</Link></Button>
      </div>
    )
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text,#0f172a)]">مشترياتي</h1>
        <p className="text-sm text-[var(--text,#0f172a)]/40 mt-1">جميع الكورسات التي قمت بشرائها</p>
      </motion.div>

      <div className="relative mb-8">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text,#0f172a)]/20" />
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ابحث في مشترياتك..."
          className="w-full h-14 pr-12 pl-4 text-base bg-[var(--card,#f8fafc)] border-[var(--border,#e2e8f0)] rounded-2xl"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <ShoppingBag className="w-20 h-20 text-[var(--text,#0f172a)]/10 mx-auto mb-4" />
          <p className="text-lg text-[var(--text,#0f172a)]/40 mb-2">
            {searchQuery ? 'لا توجد نتائج لبحثك' : 'لم تقم بأي عملية شراء بعد'}
          </p>
          {!searchQuery && (
            <Button variant="primary" asChild>
              <Link to="/">تصفح الكورسات</Link>
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map(purchase => (
            <motion.div key={purchase.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <div className="rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] overflow-hidden hover:shadow-xl transition-all duration-300">
                <Link to={`/course/${purchase.course_id}`}>
                  <div className="h-40 bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] relative overflow-hidden">
                    {purchase.course?.thumbnail ? (
                      <img src={purchase.course.thumbnail} alt={purchase.course.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-white/20 text-white border-0 backdrop-blur-sm">
                      {formatCurrency(purchase.price)}
                    </Badge>
                  </div>
                </Link>

                <div className="p-5">
                  <Link to={`/course/${purchase.course_id}`}>
                    <h3 className="font-semibold text-[var(--text,#0f172a)] truncate">{purchase.course?.name}</h3>
                  </Link>
                  {purchase.teacher && (
                    <Link to={`/teacher/${purchase.teacher_id}`} className="text-sm text-[var(--primary,#2563eb)] hover:underline mt-1 inline-block">
                      {purchase.teacher.name}
                    </Link>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border,#e2e8f0)]">
                    <div className="text-xs text-[var(--text,#0f172a)]/40">
                      {formatDate(purchase.purchased_at)}
                    </div>
                    {purchase.code?.code && (
                      <button onClick={() => handleCopy(purchase.code!.code, purchase.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary,#2563eb)]/5 text-[var(--primary,#2563eb)] text-xs font-medium hover:bg-[var(--primary,#2563eb)]/10 transition-colors"
                      >
                        {copiedId === purchase.id ? (
                          <><Check className="w-3 h-3" /> تم النسخ</>
                        ) : (
                          <><Copy className="w-3 h-3" /> نسخ الكود</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
