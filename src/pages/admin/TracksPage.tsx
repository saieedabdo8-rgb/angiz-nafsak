import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Eye, EyeOff, Archive, Loader2, GripVertical, BookMarked } from 'lucide-react'
import { getAllTracks, createTrack, updateTrack, deleteTrack, getAllSubjects, setTrackSubjects, getTrackSubjects } from '@/api/queries'
import type { Track, Subject } from '@/types'
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

const arabicChars: Record<string, string> = {
  ا: 'a', أ: 'a', إ: 'e', آ: 'a', ب: 'b', ت: 't', ث: 'th', ج: 'g',
  ح: 'h', خ: 'kh', د: 'd', ذ: 'th', ر: 'r', ز: 'z', س: 's', ش: 'sh',
  ص: 's', ض: 'd', ط: 't', ظ: 'z', ع: 'a', غ: 'gh', ف: 'f', ق: 'q',
  ك: 'k', ل: 'l', م: 'm', ن: 'n', ه: 'h', و: 'w', ي: 'y', ى: 'a',
  ة: 'h', ئ: 'e', ء: 'a', ؤ: 'o',
}

const KNOWN: Record<string, { slug: string; desc: string; icon: string; colors: { bg: string; gs: string; ge: string; tc: string; bc: string } }> = {
  'علمي علوم': {
    slug: 'science',
    desc: 'شعبة تضم مواد الأحياء والكيمياء والفيزياء.',
    icon: '🧬',
    colors: { bg: '#10B981', gs: '#34D399', ge: '#14B8A6', tc: '#FFFFFF', bc: '#FFFFFF' },
  },
  'علمي رياضة': {
    slug: 'math',
    desc: 'شعبة تضم مواد الرياضيات والكيمياء والفيزياء.',
    icon: '📐',
    colors: { bg: '#3B82F6', gs: '#6366F1', ge: '#2563EB', tc: '#FFFFFF', bc: '#FFFFFF' },
  },
  'أدبي': {
    slug: 'literary',
    desc: 'شعبة تضم مواد التاريخ والجغرافيا والإحصاء.',
    icon: '📚',
    colors: { bg: '#F97316', gs: '#FB923C', ge: '#F97316', tc: '#FFFFFF', bc: '#FFFFFF' },
  },
}

const DFLT = { bg: '#1e40af', gs: '#1e40af', ge: '#7c3aed', tc: '#ffffff', bc: '#3b82f6' }

function transliterate(text: string): string {
  return text.split('').map(c => arabicChars[c] || c).join('')
    .replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase() || 'track'
}

function makeSlug(name: string): string {
  const t = name.trim()
  if (KNOWN[t]) return KNOWN[t].slug
  return transliterate(t)
}

function dedupeSlug(base: string, tracks: Track[], currId?: string): string {
  let s = base, c = 2
  while (tracks.some(t => t.slug === s && t.id !== currId)) { s = `${base}-${c}`; c++ }
  return s
}

function makeDesc(name: string): string {
  const t = name.trim()
  if (KNOWN[t]) return KNOWN[t].desc
  return `شعبة ${t}`
}

function makeIcon(name: string): string {
  const t = name.trim()
  if (KNOWN[t]) return KNOWN[t].icon
  return '🎯'
}

function makeColors(name: string) {
  const t = name.trim()
  if (KNOWN[t]) return KNOWN[t].colors
  return DFLT
}

function freshForm(tracks: Track[]) {
  return {
    name: '', slug: '', description: '', icon: '',
    background_color: DFLT.bg, gradient_start: DFLT.gs, gradient_end: DFLT.ge,
    text_color: DFLT.tc, button_color: DFLT.bc, display_order: tracks.length, status: 'active' as const,
  }
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Track | null>(null)
  const [form, setForm] = useState<Partial<Track>>(freshForm([]))
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [focusedOnce, setFocusedOnce] = useState(false)

  const [subjectsOpen, setSubjectsOpen] = useState(false)
  const [subjectsTrack, setSubjectsTrack] = useState<Track | null>(null)
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set())
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const data = await getAllTracks()
    setTracks(data)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setSlugEdited(false)
    setFocusedOnce(false)
    setForm(freshForm(tracks))
    setDialogOpen(true)
  }

  function openEdit(track: Track) {
    setEditing(track)
    setSlugEdited(true)
    setFocusedOnce(true)
    setForm({ ...track })
    setDialogOpen(true)
  }

  function onNameChange(name: string) {
    const upd: Partial<Track> = { name }

    if (!slugEdited) {
      const base = makeSlug(name)
      upd.slug = dedupeSlug(base, tracks, editing?.id)
    }

    if (!form.description || !focusedOnce) upd.description = makeDesc(name)
    if (!form.icon || !focusedOnce) upd.icon = makeIcon(name)

    if (!editing && !slugEdited) {
      const c = makeColors(name)
      upd.background_color = c.bg
      upd.gradient_start = c.gs
      upd.gradient_end = c.ge
      upd.text_color = c.tc
      upd.button_color = c.bc
    }

    setForm({ ...form, ...upd })
  }

  async function handleSave() {
    if (!form.name?.trim()) { toast.error('اسم الشعبة مطلوب'); return }
    if (tracks.some(t => t.name === form.name!.trim() && t.id !== editing?.id)) {
      toast.error('اسم الشعبة موجود بالفعل'); return
    }
    if (!form.slug?.trim()) { toast.error('الرابط (slug) مطلوب'); return }
    if (tracks.some(t => t.slug === form.slug && t.id !== editing?.id)) {
      toast.error('الرابط موجود بالفعل'); return
    }

    setSaving(true)
    if (editing) {
      const { error } = await updateTrack(editing.id, form)
      if (error) { toast.error('حدث خطأ أثناء التحديث'); setSaving(false); return }
      toast.success('تم التحديث')
    } else {
      const { error } = await createTrack(form)
      if (error) { toast.error('حدث خطأ أثناء الإضافة'); setSaving(false); return }
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

  async function openSubjects(track: Track) {
    setSubjectsTrack(track)
    setSubjectsOpen(true)
    setSubjectsLoading(true)
    const [subjects, trackSubs] = await Promise.all([
      getAllSubjects(),
      getTrackSubjects(track.id),
    ])
    setAllSubjects(subjects)
    setSelectedSubjects(new Set(trackSubs.map(ts => ts.subject_id)))
    setSubjectsLoading(false)
  }

  async function saveSubjects() {
    if (!subjectsTrack) return
    setSubjectsLoading(true)
    const res = await setTrackSubjects(subjectsTrack.id, Array.from(selectedSubjects))
    setSubjectsLoading(false)
    if (res && 'error' in res && res.error) { toast.error('حدث خطأ'); return }
    toast.success('تم تحديث المواد')
    setSubjectsOpen(false)
  }

  function toggleSubject(id: string) {
    setSelectedSubjects(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
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
                    <Button variant="ghost" size="icon" onClick={() => openSubjects(track)} title="إدارة المواد">
                      <BookMarked className="w-4 h-4" />
                    </Button>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الاسم *</label>
                <Input
                  value={form.name || ''}
                  onChange={e => onNameChange(e.target.value)}
                  onFocus={() => setFocusedOnce(true)}
                  placeholder="مثال: علمي علوم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الرابط (slug)</label>
                <Input
                  value={form.slug || ''}
                  onChange={e => { setForm({ ...form, slug: e.target.value }); setSlugEdited(true) }}
                  placeholder="science"
                />
                <p className="text-xs text-slate-400 mt-1">يتم إنشاء الرابط تلقائياً ويمكنك تعديله إذا أردت.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الوصف</label>
              <Input value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="يتم إنشاؤه تلقائياً" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الإيكون (emoji)</label>
              <Input value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="يتم اختياره تلقائياً" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون البداية</label>
                <Input type="color" value={form.gradient_start || DFLT.gs} onChange={e => setForm({ ...form, gradient_start: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون النهاية</label>
                <Input type="color" value={form.gradient_end || DFLT.ge} onChange={e => setForm({ ...form, gradient_end: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون الخلفية</label>
                <Input type="color" value={form.background_color || DFLT.bg} onChange={e => setForm({ ...form, background_color: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون النص</label>
                <Input type="color" value={form.text_color || DFLT.tc} onChange={e => setForm({ ...form, text_color: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">لون الأزرار</label>
                <Input type="color" value={form.button_color || DFLT.bc} onChange={e => setForm({ ...form, button_color: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ترتيب العرض</label>
              <Input type="number" value={form.display_order ?? tracks.length} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>

            <div className="flex justify-start gap-4 pt-4">
              <Button onClick={handleSave} loading={saving}>{editing ? 'تحديث' : 'إضافة'}</Button>
              <Button variant="secondary" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={subjectsOpen} onOpenChange={setSubjectsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إدارة مواد {subjectsTrack?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4" dir="rtl">
            {subjectsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary,#2563eb)]" /></div>
            ) : allSubjects.length === 0 ? (
              <p className="text-center text-slate-400 py-8">لا توجد مواد مضافة. أضف مواد أولاً.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allSubjects.map(subject => (
                  <label key={subject.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedSubjects.has(subject.id) ? 'bg-[var(--primary,#2563eb)]/10 border border-[var(--primary,#2563eb)]/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.has(subject.id)}
                      onChange={() => toggleSubject(subject.id)}
                      className="w-4 h-4 rounded accent-[var(--primary,#2563eb)]"
                    />
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: subject.color || '#3b82f6' }}>
                      {subject.name[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{subject.name}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-start gap-4 pt-6">
              <Button onClick={saveSubjects} loading={subjectsLoading}>حفظ</Button>
              <Button variant="secondary" onClick={() => setSubjectsOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
