import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, LogOut, Save, Calendar, Camera, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { validatePhone, formatDate } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [logingOut, setLogingOut] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
      setAvatar(profile.avatar)
    }
  }, [profile])

  async function handleSave() {
    if (!user) return
    if (!fullName.trim()) { toast.error('الاسم مطلوب'); return }
    if (!validatePhone(phone)) { toast.error('رقم الهاتف غير صحيح'); return }

    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: fullName.trim(),
      phone,
    }).eq('id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('تم حفظ التغييرات')
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`

    const { error: uploadError } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
    if (uploadError) { toast.error(uploadError.message); return }

    const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(path)
    const { error: updateError } = await supabase.from('profiles').update({ avatar: publicUrl }).eq('id', user.id)
    if (updateError) { toast.error(updateError.message); return }

    setAvatar(publicUrl)
    toast.success('تم تحديث الصورة')
  }

  async function handleLogout() {
    setLogingOut(true)
    await signOut()
    navigate('/login')
  }

  if (authLoading) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <Skeleton className="h-48 rounded-3xl" />
        <Skeleton className="h-12 w-48 mx-auto rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!user || !profile) return null

  return (
    <div className="max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] relative" />

          <div className="px-6 pb-6">
            <div className="flex justify-center -mt-16 mb-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-[var(--card,#f8fafc)]">
                  {avatar ? (
                    <img src={avatar} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--primary,#2563eb)]/10 to-[var(--secondary,#7c3aed)]/10">
                      <User className="w-10 h-10 text-[var(--primary,#2563eb)]/40" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -left-1 w-9 h-9 rounded-xl bg-[var(--primary,#2563eb)] text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-[var(--primary,#2563eb)]/80 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[var(--text,#0f172a)]">{profile.full_name}</h1>
              <Badge variant="secondary" className="mt-2 capitalize">
                {profile.role === 'admin' ? 'مدير' : 'طالب'}
              </Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card,#f8fafc)] border border-[var(--border,#e2e8f0)]">
                <Calendar className="w-4 h-4 text-[var(--primary,#2563eb)]" />
                <div>
                  <p className="text-xs text-[var(--text,#0f172a)]/40">تاريخ التسجيل</p>
                  <p className="text-sm font-medium text-[var(--text,#0f172a)]">{formatDate(profile.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card,#f8fafc)] border border-[var(--border,#e2e8f0)]">
                <Shield className="w-4 h-4 text-[var(--primary,#2563eb)]" />
                <div>
                  <p className="text-xs text-[var(--text,#0f172a)]/40">نوع الحساب</p>
                  <p className="text-sm font-medium text-[var(--text,#0f172a)]">{profile.role === 'admin' ? 'مدير' : 'طالب'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-1.5">الاسم الكامل</label>
                <Input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="rounded-xl bg-[var(--card,#f8fafc)] border-[var(--border,#e2e8f0)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text,#0f172a)] mb-1.5">رقم الهاتف</label>
                <Input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="rounded-xl bg-[var(--card,#f8fafc)] border-[var(--border,#e2e8f0)]"
                  dir="ltr"
                />
              </div>

              <Button variant="primary" size="lg" className="w-full" onClick={handleSave} loading={saving}>
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </Button>
            </div>
          </div>
        </Card>

        <Button variant="secondary" size="lg" className="w-full" onClick={handleLogout} loading={logingOut}>
          <LogOut className="w-4 h-4" />
          تسجيل الخروج
        </Button>
      </motion.div>
    </div>
  )
}
