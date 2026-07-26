import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, User, Phone, Lock, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { validatePhone, validatePassword } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    if (!fullName.trim()) return setErrors({ fullName: 'الاسم مطلوب' })
    if (!phone) return setErrors({ phone: 'رقم الهاتف مطلوب' })
    if (!validatePhone(phone)) return setErrors({ phone: 'رقم الهاتف غير صحيح' })
    const pwError = validatePassword(password)
    if (pwError) return setErrors({ password: pwError })
    if (password !== confirmPassword) return setErrors({ confirmPassword: 'كلمة المرور غير متطابقة' })

    setLoading(true)
    const { error } = await signUp(fullName, phone, password)
    setLoading(false)

    if (error) {
      toast.error(error)
      return
    }

    toast.success('تم إنشاء الحساب بنجاح')
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--primary,#2563eb)]/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text,#0f172a)]">إنشاء حساب جديد</h1>
            <p className="text-sm text-[var(--text,#0f172a)]/40 mt-1">انضم إلى أنجز نفسك وابدأ رحلة التفوق</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-1.5">الاسم بالكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text,#0f172a)]/40" />
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="pr-10"
                  error={errors.fullName}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-1.5">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text,#0f172a)]/40" />
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="pr-10"
                  error={errors.phone}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text,#0f172a)]/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  error={errors.password}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text,#0f172a)]/40" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                  error={errors.confirmPassword}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading}>
              <UserPlus className="w-4 h-4" />
              إنشاء حساب
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text,#0f172a)]/40 mt-6">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-[var(--primary,#2563eb)] font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
