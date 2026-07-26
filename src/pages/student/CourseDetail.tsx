import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, GraduationCap, CreditCard, Smartphone, Shield } from 'lucide-react'
import { getCourse, createOrder, uploadScreenshot, createPayment } from '@/api/queries'
import { useAuth } from '@/contexts/AuthContext'
import type { Course } from '@/types'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'vodafone_cash'>('instapay')
  const [receipt, setReceipt] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (courseId) {
      getCourse(courseId).then(data => {
        setCourse(data)
        setLoading(false)
      })
    }
  }, [courseId])

  async function handlePurchase() {
    if (!user || !course) return
    setSubmitting(true)
    try {
      const { data: order, error: orderError } = await createOrder(user.id, course.id, course.teacher_id, course.price)
      if (orderError || !order) throw new Error(orderError?.message || 'فشل إنشاء الطلب')

      let screenshotUrl = ''
      if (receipt) {
        const url = await uploadScreenshot(user.id, receipt)
        if (url) screenshotUrl = url
      }

      const { error: paymentError } = await createPayment(order.id, user.id, course.price, paymentMethod, screenshotUrl)
      if (paymentError) throw new Error(paymentError.message)

      toast.success('تم تقديم طلبك بنجاح، في انتظار الموافقة')
      navigate('/purchases')
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    )
  }

  if (!course) return <div className="text-center py-16"><p className="text-lg text-[var(--text,#0f172a)]/40">الكورس غير موجود</p></div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[var(--text,#0f172a)]/40 mb-6">
        <Link to="/" className="hover:text-[var(--primary,#2563eb)]">الرئيسية</Link>
        <span>/</span>
        <Link to={`/teacher/${course.teacher_id}`} className="hover:text-[var(--primary,#2563eb)]">{course.teacher?.name}</Link>
        <span>/</span>
        <span className="text-[var(--text,#0f172a)]">{course.name}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden mb-8">
          <div className="h-48 bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center">
            {course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover" /> : <GraduationCap className="w-20 h-20 text-white/30" />}
          </div>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold text-[var(--text,#0f172a)] mb-2">{course.name}</h1>
            {course.description && <p className="text-[var(--text,#0f172a)]/60 mb-6">{course.description}</p>}
            <div className="flex items-center justify-between p-4 bg-[var(--card,#f8fafc)] rounded-2xl border border-[var(--border,#e2e8f0)]">
              <span className="text-[var(--text,#0f172a)]/60">السعر</span>
              <span className="text-2xl font-bold text-[var(--primary,#2563eb)]">{formatCurrency(course.price)}</span>
            </div>
          </CardContent>
        </Card>

        {!user ? (
          <div className="text-center p-8 rounded-2xl border border-[var(--border,#e2e8f0)]">
            <p className="text-[var(--text,#0f172a)]/60 mb-4">يجب تسجيل الدخول أولاً للشراء</p>
            <Button variant="primary" onClick={() => navigate('/login')}>تسجيل الدخول</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-[var(--text,#0f172a)] mb-3">طريقة الدفع</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPaymentMethod('instapay')}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${paymentMethod === 'instapay' ? 'border-[var(--primary,#2563eb)] bg-[var(--primary,#2563eb)]/5' : 'border-[var(--border,#e2e8f0)] hover:border-[var(--primary,#2563eb)]/50'}`}>
                  <CreditCard className="w-6 h-6 mx-auto mb-1 text-[var(--primary,#2563eb)]" />
                  <span className="text-sm font-medium text-[var(--text,#0f172a)]">InstaPay</span>
                </button>
                <button onClick={() => setPaymentMethod('vodafone_cash')}
                  className={`p-4 rounded-2xl border-2 text-center transition-all ${paymentMethod === 'vodafone_cash' ? 'border-[var(--primary,#2563eb)] bg-[var(--primary,#2563eb)]/5' : 'border-[var(--border,#e2e8f0)] hover:border-[var(--primary,#2563eb)]/50'}`}>
                  <Smartphone className="w-6 h-6 mx-auto mb-1 text-red-500" />
                  <span className="text-sm font-medium text-[var(--text,#0f172a)]">فودافون كاش</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-2">إرفاق إيصال الدفع</label>
              <div className="border-2 border-dashed border-[var(--border,#e2e8f0)] rounded-2xl p-6 text-center hover:border-[var(--primary,#2563eb)]/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('receipt')?.click()}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--text,#0f172a)]/40" />
                <p className="text-sm text-[var(--text,#0f172a)]/60">
                  {receipt ? receipt.name : 'اضغط لرفع صورة الإيصال'}
                </p>
                <input id="receipt" type="file" accept="image/*" className="hidden"
                  onChange={e => setReceipt(e.target.files?.[0] || null)} />
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full" onClick={handlePurchase} loading={submitting}>
              <Shield className="w-4 h-4" />
              تأكيد الشراء - {formatCurrency(course.price)}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
