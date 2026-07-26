import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Loader2, GripVertical } from 'lucide-react'
import { getAllTracks, createTrack, updateTrack, deleteTrack } from '@/api/queries'
import type { Track } from '@/types'
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
  name: '', slug: '', description: '', icon: '',
  background_color: '#1e40af', gradient_start: '#1e40af', gradient_end: '#7c3aed',
  text_color: '#ffffff', button_color: '#3b82f6', display_order: 0, status: 'active' as const,
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Track | null>(null)
  const [form, setForm] = useState<Partial<Track>>(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getAllTracks()
    setTracks(data)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(track: Track) {
    setEditing(track)
    setForm({ ...track })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.slug) { toast.error('الاسم والرابط مطلوبان'); return }
    setSaving(true)
    if (editing) {
      const { error } = await updateTrack(editing.id, form)
      if (error) { toast.error('حدث خطأ'); setSaving(false); return }
      toast.success('تم التحديث')
    } else {
      const { error } = await createTrack(form)
      if (error) { toast.error('حدث خطأ'); setSaving(false); return }
      toast.success('تم الإضافة')
    }
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return
    const { error } = await deleteTrack(id)
    if (error) { toast.error('حدث خطأ'); return }
    toast.success('تم الحذف')
    load()
  }

  async function toggleStatus(track: Track) {
    const next = track.status === 'active' ? 'hidden' : track.status === 'hidden' ? 'archived' : 'active'
    const { error } = await updateTrack(track.id, { status: next })
    if (!error) { toast.success('تم التحديث'); load() }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الشعب الدراسية</h1>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />إضافة شعبة</Button>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا توجد شعب دراسية</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track, i) => (
            <motion.div key={track.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4">
                  <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `linear-gradient(135deg, ${track.gradient_start}, ${track.gradient_end})` }}>
                    {track.icon || '🎯'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{track.name}</p>
                    <p className="text-xs text-slate-400 truncate">{track.slug}</p>
                  </div>

                  <Badge variant={statusColors[track.status]}>{statusLabels[track.status]}</Badge>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(track)} title="تغيير الحالة">
                      {track.status === 'active' ? <EyeOff className="w-4 h-4" /> : track.status === 'hidden' ? <Archive className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(track)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(track.id)} className="text-red-500 hover:text-red-700">
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
            <DialogTitle>{editing ? 'تعديل شعبة' : 'إضافة شعبة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم</label>
                <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="اسم الشعبة" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الرابط (slug)</label>
                <Input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="track-slug" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
              <Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="وصف الشعبة" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الإيكون (emoji)</label>
              <Input value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="🎯" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون البداية</label>
                <Input type="color" value={form.gradient_start || '#1e40af'} onChange={e => setForm({ ...form, gradient_start: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون النهاية</label>
                <Input type="color" value={form.gradient_end || '#7c3aed'} onChange={e => setForm({ ...form, gradient_end: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون الخلفية</label>
                <Input type="color" value={form.background_color || '#1e40af'} onChange={e => setForm({ ...form, background_color: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون النص</label>
                <Input type="color" value={form.text_color || '#ffffff'} onChange={e => setForm({ ...form, text_color: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون الأزرار</label>
                <Input type="color" value={form.button_color || '#3b82f6'} onChange={e => setForm({ ...form, button_color: e.target.value })} />
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
