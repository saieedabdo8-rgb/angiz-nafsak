import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Loader2 } from 'lucide-react'
import { getAllSubjects, getAllTracks, createSubject, updateSubject, deleteSubject, setTrackSubjects } from '@/api/queries'
import { supabase } from '@/lib/supabase'
import type { Subject, Track } from '@/types'
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

const defaultForm = {
  name: '', slug: '', icon: '', color: '#7c3aed', description: '',
  display_order: 0, status: 'active' as const,
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Subject | null>(null)
  const [form, setForm] = useState<Partial<Subject>>(defaultForm)
  const [selectedTracks, setSelectedTracks] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [subjectsData, tracksData] = await Promise.all([getAllSubjects(), getAllTracks()])
    setSubjects(subjectsData)
    setTracks(tracksData)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setSelectedTracks([])
    setDialogOpen(true)
  }

  async function openEdit(subject: Subject) {
    setEditing(subject)
    setForm({ ...subject })
    const { data: trackSubjects } = await supabase.from('track_subjects').select('track_id').eq('subject_id', subject.id)
    setSelectedTracks(trackSubjects?.map(ts => ts.track_id) || [])
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.slug) { toast.error('الاسم والرابط مطلوبان'); return }
    setSaving(true)
    if (editing) {
      const { error } = await updateSubject(editing.id, form)
      if (error) { toast.error('حدث خطأ'); setSaving(false); return }
      await setTrackSubjects(editing.id, selectedTracks)
      toast.success('تم التحديث')
    } else {
      const { data, error } = await createSubject(form)
      if (error || !data) { toast.error('حدث خطأ'); setSaving(false); return }
      await setTrackSubjects(data.id, selectedTracks)
      toast.success('تم الإضافة')
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return
    const { error } = await deleteSubject(id)
    if (error) { toast.error('حدث خطأ'); return }
    toast.success('تم الحذف')
    load()
  }

  async function toggleStatus(subject: Subject) {
    const next = subject.status === 'active' ? 'hidden' : subject.status === 'hidden' ? 'archived' : 'active'
    const { error } = await updateSubject(subject.id, { status: next })
    if (!error) { toast.success('تم التحديث'); load() }
  }

  function toggleTrack(trackId: string) {
    setSelectedTracks(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId])
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">المواد</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />إضافة مادة</Button>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا توجد مواد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject, i) => (
            <motion.div key={subject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: subject.color || '#7c3aed' }}>
                    {subject.icon || '📚'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{subject.name}</p>
                    <p className="text-xs text-slate-400 truncate">{subject.slug}</p>
                  </div>

                  <Badge variant={statusColors[subject.status]}>{statusLabels[subject.status]}</Badge>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(subject)} title="تغيير الحالة">
                      {subject.status === 'active' ? <EyeOff className="w-4 h-4" /> : subject.status === 'hidden' ? <Archive className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(subject)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)} className="text-red-500 hover:text-red-700">
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'تعديل مادة' : 'إضافة مادة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم</label>
                <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم المادة" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الرابط (slug)</label>
                <Input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="subject-slug" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
              <Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الإيكون</label>
                <Input value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="📚" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اللون</label>
                <Input type="color" value={form.color || '#7c3aed'} onChange={e => setForm({ ...form, color: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ترتيب العرض</label>
              <Input type="number" value={form.display_order ?? 0} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">الشعب المرتبطة</label>
              <div className="flex flex-wrap gap-2">
                {tracks.map(track => (
                  <button key={track.id} type="button" onClick={() => toggleTrack(track.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                      selectedTracks.includes(track.id)
                        ? 'bg-[var(--primary,#2563eb)] text-white border-[var(--primary,#2563eb)]'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}>
                    {track.name}
                  </button>
                ))}
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
