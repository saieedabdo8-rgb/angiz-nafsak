import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Loader2, Upload } from 'lucide-react'
import { getAllCourses, getAllTeachers, getAllTracks, getAllSubjects, createCourse, updateCourse, deleteCourse, uploadFile } from '@/api/queries'
import type { Course, Teacher, Track, Subject } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
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

type CourseForm = Partial<Course> & { track_ids: string[] }

const defaultForm: CourseForm = {
  name: '', description: '', teacher_id: '', track_ids: [] as string[],
  subject_id: null, price: 0, thumbnail: null, status: 'active',
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseForm>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [coursesData, teachersData, tracksData, subjectsData] = await Promise.all([
      getAllCourses(), getAllTeachers(), getAllTracks(), getAllSubjects(),
    ])
    setCourses(coursesData)
    setTeachers(teachersData)
    setTracks(tracksData)
    setSubjects(subjectsData)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setThumbFile(null)
    setThumbPreview(null)
    setDialogOpen(true)
  }

  function openEdit(course: Course) {
    setEditing(course)
    setForm({ ...course, track_ids: course.tracks?.map(t => t.id) || [] })
    setThumbPreview(course.thumbnail)
    setThumbFile(null)
    setDialogOpen(true)
  }

  async function handleThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbFile(file)
    setThumbPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!form.name || !form.teacher_id) { toast.error('الاسم والمدرس مطلوبان'); return }
    setSaving(true)

    let thumbUrl = form.thumbnail
    if (thumbFile) {
      const url = await uploadFile('courses', `${Date.now()}-${thumbFile.name}`, thumbFile)
      if (url) thumbUrl = url
    }

    const { tracks: _tracks, created_at, updated_at, ...payload } = form as any
    payload.thumbnail = thumbUrl
    payload.price = Number(form.price)

    if (editing) {
      const r = await updateCourse(editing.id, payload)
      if (r?.error) { toast.error('حدث خطأ'); setSaving(false); return }
      toast.success('تم التحديث')
    } else {
      const r = await createCourse(payload)
      if (r?.error) { toast.error('حدث خطأ'); setSaving(false); return }
      toast.success('تم الإضافة')
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return
    const { error } = await deleteCourse(id)
    if (error) { toast.error('حدث خطأ'); return }
    toast.success('تم الحذف')
    load()
  }

  async function toggleStatus(course: Course) {
    const next = course.status === 'active' ? 'hidden' : course.status === 'hidden' ? 'archived' : 'active'
    const { error } = await updateCourse(course.id, { status: next })
    if (!error) { toast.success('تم التحديث'); load() }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الكورسات</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />إضافة كورس</Button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا توجد كورسات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course, i) => (
            <motion.div key={course.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">📹</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{course.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {course.teacher?.name}{course.subject ? ` - ${course.subject.name}` : ''}
                    </p>
                  </div>

                  <div className="text-sm font-semibold text-[var(--primary,#2563eb)]">{formatCurrency(course.price)}</div>
                  <Badge variant={statusColors[course.status]}>{statusLabels[course.status]}</Badge>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(course)}>
                      {course.status === 'active' ? <EyeOff className="w-4 h-4" /> : course.status === 'hidden' ? <Archive className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(course)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)} className="text-red-500 hover:text-red-700">
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
            <DialogTitle>{editing ? 'تعديل كورس' : 'إضافة كورس'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اسم الكورس</label>
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم الكورس" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
              <Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف الكورس" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المدرس</label>
                <select value={form.teacher_id || ''} onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-4 py-2 text-sm text-[var(--text,#0f172a)]">
                  <option value="">اختر المدرس</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المادة</label>
                <select value={form.subject_id || ''} onChange={e => setForm({ ...form, subject_id: e.target.value || null })}
                  className="flex h-11 w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-4 py-2 text-sm text-[var(--text,#0f172a)]">
                  <option value="">بدون مادة</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">السعر</label>
                <Input type="number" value={form.price ?? 0} onChange={e => setForm({ ...form, price: Number(e.target.value) })} placeholder="السعر" />
              </div>
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

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الصورة المصغرة</label>
              <div className="flex items-center gap-3">
                {thumbPreview && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Upload className="w-4 h-4" />اختيار صورة
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
                </label>
              </div>
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
