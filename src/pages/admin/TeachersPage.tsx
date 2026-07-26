import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Loader2, Upload } from 'lucide-react'
import { getAllTeachers, getAllSubjects, getAllTracks, createTeacher, updateTeacher, deleteTeacher, uploadFile } from '@/api/queries'
import type { Teacher, Subject, Track } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import toast from 'react-hot-toast'

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  active: 'success',
  hidden: 'warning',
  archived: 'danger',
}

const statusLabels: Record<string, string> = {
  active: 'نشط',
  hidden: 'مخفي',
  archived: 'مؤرشف',
}

type TeacherForm = Partial<Teacher> & { track_ids: string[] }

const defaultForm: TeacherForm = {
  name: '', bio: '', photo: null, cover: null,
  subject_id: '', track_ids: [] as string[],
  experience: '', facebook: '', telegram: '', whatsapp: '', youtube: '',
  display_order: 0, status: 'active',
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState<TeacherForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [teachersData, subjectsData, tracksData] = await Promise.all([
      getAllTeachers(), getAllSubjects(), getAllTracks(),
    ])
    setTeachers(teachersData)
    setSubjects(subjectsData)
    setTracks(tracksData)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setPhotoFile(null)
    setPhotoPreview(null)
    setDialogOpen(true)
  }

  function openEdit(teacher: Teacher) {
    setEditing(teacher)
    setForm({ ...teacher, track_ids: teacher.tracks?.map(t => t.id) || [] })
    setPhotoPreview(teacher.photo)
    setPhotoFile(null)
    setDialogOpen(true)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.name || !form.subject_id) { toast.error('الاسم والمادة مطلوبان'); return }
    setSaving(true)

    let photoUrl = form.photo
    if (photoFile) {
      const url = await uploadFile('teachers', `${Date.now()}-${photoFile.name}`, photoFile)
      if (url) photoUrl = url
    }

    const { subject, tracks: _tracks, created_at, updated_at, rating, ...cleanForm } = form as any
    cleanForm.photo = photoUrl
    if (!cleanForm.cover) delete cleanForm.cover

    const r = editing
      ? await updateTeacher(editing.id, cleanForm)
      : await createTeacher(cleanForm)

    if (r?.error) {
      console.error('save teacher error:', JSON.stringify(r.error))
      toast.error('رمز الخطأ: ' + (r.error.code || '') + ' - ' + (r.error.message || 'حدث خطأ'))
      setSaving(false)
      return
    }
    toast.success(editing ? 'تم التحديث' : 'تم الإضافة')
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return
    const { error } = await deleteTeacher(id)
    if (error) { toast.error('حدث خطأ'); return }
    toast.success('تم الحذف')
    load()
  }

  async function toggleStatus(teacher: Teacher) {
    const next = teacher.status === 'active' ? 'hidden' : teacher.status === 'hidden' ? 'archived' : 'active'
    const { error } = await updateTeacher(teacher.id, { status: next })
    if (!error) { toast.success('تم التحديث'); load() }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">المدرسون</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />إضافة مدرس</Button>
      </div>

      {teachers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا يوجد مدرسون</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map((teacher, i) => (
            <motion.div key={teacher.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {teacher.photo ? (
                      <img src={teacher.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-slate-400">
                        {teacher.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{teacher.name}</p>
                    <p className="text-xs text-slate-400 truncate">{teacher.subject?.name}{teacher.tracks?.length ? ` - ${teacher.tracks.map(t => t.name).join('، ')}` : ''}</p>
                  </div>

                  <Badge variant={statusColors[teacher.status]}>{statusLabels[teacher.status]}</Badge>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(teacher)}>
                      {teacher.status === 'active' ? <EyeOff className="w-4 h-4" /> : teacher.status === 'hidden' ? <Archive className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(teacher)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل مدرس' : 'إضافة مدرس'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم</label>
                <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم المدرس" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الخبرة</label>
                <Input value={form.experience || ''} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="مثلاً: ١٠ سنوات خبرة" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">السيرة الذاتية</label>
              <Input value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="نبذة عن المدرس" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المادة</label>
                <select value={form.subject_id || ''} onChange={e => setForm({ ...form, subject_id: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-4 py-2 text-sm text-[var(--text,#0f172a)]">
                  <option value="">اختر المادة</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الشعب (اختياري - يمكن اختيار أكثر من شعبة)</label>
                <div className="space-y-2 max-h-40 overflow-y-auto rounded-xl border border-[var(--border,#e2e8f0)] p-3">
                  {tracks.length === 0 ? (
                    <p className="text-sm text-slate-400">لا توجد شعب</p>
                  ) : tracks.map(t => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.track_ids?.includes(t.id) || false}
                        onChange={e => {
                          const next = e.target.checked
                            ? [...(form.track_ids || []), t.id]
                            : (form.track_ids || []).filter(id => id !== t.id)
                          setForm({ ...form, track_ids: next })
                        }}
                        className="w-4 h-4 rounded accent-[var(--primary,#2563eb)]"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصورة الشخصية</label>
              <div className="flex items-center gap-4">
                {photoPreview && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Upload className="w-4 h-4" />اختيار صورة
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">روابط التواصل</label>
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.facebook || ''} onChange={e => setForm({ ...form, facebook: e.target.value })} placeholder="رابط Facebook" />
                <Input value={form.telegram || ''} onChange={e => setForm({ ...form, telegram: e.target.value })} placeholder="رابط Telegram" />
                <Input value={form.whatsapp || ''} onChange={e => setForm({ ...form, whatsapp: e.target.value })} placeholder="رقم WhatsApp" />
                <Input value={form.youtube || ''} onChange={e => setForm({ ...form, youtube: e.target.value })} placeholder="رابط YouTube" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ترتيب العرض</label>
              <Input type="number" value={form.display_order ?? 0} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>

            <div className="flex justify-start gap-4 pt-4">
              <Button onClick={handleSave} loading={saving}>{editing ? 'تحديث' : 'إضافة'}</Button>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
