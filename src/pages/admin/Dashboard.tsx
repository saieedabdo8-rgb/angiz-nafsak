import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Users, GraduationCap, BookOpen, ShoppingBag, DollarSign, ClipboardList, QrCode, TrendingUp, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Stats {
  students: number
  teachers: number
  courses: number
  orders: number
  purchases: number
  revenue: number
  pendingOrders: number
  unusedCodes: number
  soldCodes: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    students: 0, teachers: 0, courses: 0, orders: 0,
    purchases: 0, revenue: 0, pendingOrders: 0,
    unusedCodes: 0, soldCodes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: students },
        { count: teachers },
        { count: courses },
        { count: orders },
        { count: purchases },
        { count: pendingOrders },
        { count: unusedCodes },
        { count: soldCodes },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('teachers').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('purchases').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending'),
        supabase.from('codes').select('*', { count: 'exact', head: true }).eq('status', 'unused'),
        supabase.from('codes').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
      ])

      const { data: purchasesData } = await supabase.from('purchases').select('price')
      const revenue = purchasesData?.reduce((sum, p) => sum + Number(p.price), 0) || 0

      setStats({
        students: students || 0, teachers: teachers || 0, courses: courses || 0,
        orders: orders || 0, purchases: purchases || 0, revenue,
        pendingOrders: pendingOrders || 0, unusedCodes: unusedCodes || 0, soldCodes: soldCodes || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'الطلاب', value: stats.students, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'المدرسون', value: stats.teachers, icon: GraduationCap, color: 'from-purple-500 to-purple-600' },
    { label: 'الكورسات', value: stats.courses, icon: BookOpen, color: 'from-green-500 to-green-600' },
    { label: 'الطلبات', value: stats.orders, icon: ClipboardList, color: 'from-orange-500 to-orange-600' },
    { label: 'المشتريات', value: stats.purchases, icon: ShoppingBag, color: 'from-pink-500 to-pink-600' },
    { label: 'الإيرادات', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'from-emerald-500 to-emerald-600' },
    { label: 'طلبات معلقة', value: stats.pendingOrders, icon: TrendingUp, color: 'from-yellow-500 to-yellow-600' },
    { label: 'أكواد غير مستخدمة', value: stats.unusedCodes, icon: QrCode, color: 'from-cyan-500 to-cyan-600' },
    { label: 'أكواد مباعة', value: stats.soldCodes, icon: QrCode, color: 'from-red-500 to-red-600' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">لوحة التحكم</h1>

      <motion.div initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {cards.map((card, i) => (
          <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-white/70 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
