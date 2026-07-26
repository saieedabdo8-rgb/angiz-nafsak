import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2, Trash2, Download, Upload, Copy, Check } from 'lucide-react'
import { getAllCourses, getCodes, bulkImportCodes, addSingleCode, deleteCode } from '@/api/queries'
import type { Course, Code } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  unused: 'success',
  reserved: 'warning',
  sold: 'danger',
}

const statusLabels: Record<string, string> = {
  unused: 'غير مستخدم',
  reserved: 'محجوز',
  sold: 'مباع',
}

export default function CodesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [codes, setCodes] = useState<Code[]>([])
  const [loading, setLoading] = useState(true)
  const [codesLoading, setCodesLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [singleCode, setSingleCode] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [dialogOpen, setDialogOpen] = useState<'single' | 'bulk' | null>(null)
  const [saving, setSaving] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    getAllCourses().then(data => {
      setCourses(data)
      if (data.length > 0) setSelectedCourseId(data[0].id)
      setLoading(false)
    })
  }, [])

  const loadCodes = useCallback(async () => {
    if (!selectedCourseId) return
    setCodesLoading(true)
    const data = await getCodes(selectedCourseId)
    setCodes(data)
    setCodesLoading(false)
  }, [selectedCourseId])

  useEffect(() => { loadCodes() }, [loadCodes])

  async function handleAddSingle() {
    if (!singleCode.trim()) { toast.error('الرجاء إدخال الكود'); return }
    setSaving(true)
    const { error } = await addSingleCode(selectedCourseId, singleCode.trim())
    if (error) { toast.error('حدث خطأ'); setSaving(false); return }
    toast.success('تم إضافة الكود')
    setSingleCode('')
    setSaving(false)
    setDialogOpen(null)
    loadCodes()
  }

  async function handleBulkImport() {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines.length) { toast.error('الرجاء إدخال الأكواد'); return }
    setSaving(true)
    const { error } = await bulkImportCodes(selectedCourseId, lines)
    if (error) { toast.error('حدث خطأ'); setSaving(false); return }
    toast.success(`تم إضافة ${lines.length} كود`)
    setBulkText('')
    setSaving(false)
    setDialogOpen(null)
    loadCodes()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكود؟')) return
    const { error } = await deleteCode(id)
    if (error) { toast.error('حدث خطأ'); return }
    toast.success('تم الحذف')
    loadCodes()
  }

  function copyCode(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function exportCodes() {
    const filtered = statusFilter === 'all' ? codes : codes.filter(c => c.status === statusFilter)
    const text = filtered.map(c => c.code).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codes-${selectedCourseId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredCodes = statusFilter === 'all' ? codes : codes.filter(c => c.status === statusFilter)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">أكواد التفعيل</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setDialogOpen('single')}><Plus className="w-4 h-4" />إضافة كود</Button>
          <Button variant="outline" onClick={() => setDialogOpen('bulk')}><Upload className="w-4 h-4" />استيراد</Button>
          <Button variant="outline" onClick={exportCodes}><Download className="w-4 h-4" />تصدير</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">اختر الكورس</label>
              <select value={selectedCourseId} onChange={e => { setSelectedCourseId(e.target.value); setStatusFilter('all') }}
                className="flex h-11 w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-4 py-2 text-sm text-[var(--text,#0f172a)]">
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الحالة</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="flex h-11 rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 px-4 py-2 text-sm text-[var(--text,#0f172a)]">
                <option value="all">الكل</option>
                <option value="unused">غير مستخدم</option>
                <option value="reserved">محجوز</option>
                <option value="sold">مباع</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {codesLoading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-slate-400">لا توجد أكواد</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border,#e2e8f0)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900">
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الكود</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">الحالة</th>
                <th className="text-right p-4 font-medium text-slate-600 dark:text-slate-400">تاريخ البيع</th>
                <th className="text-left p-4 font-medium text-slate-600 dark:text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border,#e2e8f0)]">
              {filteredCodes.map((code, i) => (
                <motion.tr key={code.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="p-4">
                    <span dir="ltr" className="font-mono text-sm text-slate-700 dark:text-slate-300">{code.code}</span>
                  </td>
                  <td className="p-4"><Badge variant={statusColors[code.status]}>{statusLabels[code.status]}</Badge></td>
                  <td className="p-4 text-slate-500">{code.sold_at ? formatDate(code.sold_at) : '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyCode(code.code, code.id)}>
                        {copiedId === code.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(code.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen === 'single'} onOpenChange={o => setDialogOpen(o ? 'single' : null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>إضافة كود</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <Input value={singleCode} onChange={e => setSingleCode(e.target.value)} placeholder="أدخل الكود" />
            <div className="flex justify-start gap-4">
              <Button onClick={handleAddSingle} loading={saving}>إضافة</Button>
              <Button variant="secondary" onClick={() => setDialogOpen(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen === 'bulk'} onOpenChange={o => setDialogOpen(o ? 'bulk' : null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>استيراد أكواد</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4" dir="rtl">
            <p className="text-sm text-slate-500">أدخل الأكواد سطراً سطراً (كود واحد في كل سطر)</p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={10} dir="ltr"
              className="w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 p-4 text-sm font-mono text-[var(--text,#0f172a)] resize-none"
              placeholder="CODE001&#10;CODE002&#10;CODE003" />
            <div className="flex justify-start gap-4">
              <Button onClick={handleBulkImport} loading={saving}>استيراد</Button>
              <Button variant="secondary" onClick={() => setDialogOpen(null)}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
