import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RotateCcw, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface ThemeSection {
  title: string
  keys: { key: string; label: string }[]
}

const sections: ThemeSection[] = [
  {
    title: 'عام',
    keys: [
      { key: 'primary', label: 'اللون الأساسي' },
      { key: 'secondary', label: 'اللون الثانوي' },
      { key: 'accent', label: 'لون التمييز' },
    ],
  },
  {
    title: 'الخلفيات',
    keys: [
      { key: 'background', label: 'لون الخلفية' },
      { key: 'card', label: 'لون البطاقات' },
      { key: 'border', label: 'لون الحدود' },
    ],
  },
  {
    title: 'النصوص',
    keys: [
      { key: 'text', label: 'لون النص' },
    ],
  },
  {
    title: 'حالات',
    keys: [
      { key: 'success', label: 'نجاح' },
      { key: 'warning', label: 'تحذير' },
      { key: 'danger', label: 'خطر' },
      { key: 'info', label: 'معلومات' },
    ],
  },
  {
    title: 'الهيدر والفوتر',
    keys: [
      { key: 'header_bg', label: 'خلفية الهيدر' },
      { key: 'footer_bg', label: 'خلفية الفوتر' },
      { key: 'sidebar_bg', label: 'خلفية القائمة الجانبية' },
    ],
  },
  {
    title: 'الهيرو',
    keys: [
      { key: 'hero_bg', label: 'خلفية الهيرو' },
    ],
  },
  {
    title: 'الأزرار',
    keys: [
      { key: 'button_bg', label: 'خلفية الأزرار' },
      { key: 'button_text', label: 'لون نص الأزرار' },
    ],
  },
]

const defaults: Record<string, string> = {
  primary: '#2563eb',
  secondary: '#7c3aed',
  accent: '#f59e0b',
  background: '#ffffff',
  card: '#f8fafc',
  text: '#0f172a',
  border: '#e2e8f0',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  header_bg: '#ffffff',
  footer_bg: '#1e293b',
  sidebar_bg: '#ffffff',
  hero_bg: '#1e40af',
  button_bg: '#3b82f6',
  button_text: '#ffffff',
}

export default function ThemePage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('theme_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = { ...defaults }
        for (const row of data) map[row.key] = row.value
        setSettings(map)
        applyTheme(map)
      } else {
        setSettings({ ...defaults })
        applyTheme(defaults)
      }
      setLoading(false)
    })
  }, [])

  function applyTheme(values: Record<string, string>) {
    const root = document.documentElement
    for (const [key, value] of Object.entries(values)) {
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value)
    }
  }

  function handleChange(key: string, value: string) {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, value)
  }

  async function handleSave() {
    setSaving(true)
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from('theme_settings').upsert({ key, value }, { onConflict: 'key' })
    )
    await Promise.all(promises)
    toast.success('تم حفظ الإعدادات')
    setSaving(false)
  }

  function resetToDefaults() {
    setSettings({ ...defaults })
    applyTheme(defaults)
    toast.success('تم استعادة الإعدادات الافتراضية')
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">مدير الثيم</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToDefaults}><RotateCcw className="w-4 h-4" />استعادة الافتراضي</Button>
          <Button onClick={handleSave} loading={saving}>حفظ الإعدادات</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {sections.map(section => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.keys.map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="text-sm text-slate-600 dark:text-slate-400 w-28">{label}</label>
                      <Input type="color" value={settings[key] || defaults[key]}
                        onChange={e => handleChange(key, e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer" />
                      <Input value={settings[key] || defaults[key]}
                        onChange={e => handleChange(key, e.target.value)}
                        className="flex-1 font-mono text-xs" dir="ltr" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Live Preview */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-4 h-4" />معاينة حية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 rounded-2xl border" style={{ backgroundColor: settings.card || defaults.card, borderColor: settings.border || defaults.border }}>
                <h3 className="text-lg font-bold mb-2" style={{ color: settings.text || defaults.text }}>نص تجريبي</h3>
                <p className="text-sm mb-4" style={{ color: settings.text || defaults.text, opacity: 0.6 }}>هذا نص تجريبي لمعاينة الثيم والتعديلات المباشرة</p>
                <div className="flex gap-3">
                  <button style={{ backgroundColor: settings.button_bg || defaults.button_bg, color: settings.button_text || defaults.button_text }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-90">
                    زر تجريبي
                  </button>
                  <button style={{ borderColor: settings.border || defaults.border, color: settings.primary || defaults.primary }}
                    className="px-4 py-2 rounded-xl text-sm font-medium border transition-all hover:bg-slate-50">
                    زر ثانوي
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl text-white text-sm font-medium" style={{ background: `linear-gradient(135deg, ${settings.primary || defaults.primary}, ${settings.secondary || defaults.secondary})` }}>
                  تدرج أساسي
                </div>
                <div className="p-4 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: settings.success || defaults.success }}>
                  نجاح
                </div>
                <div className="p-4 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: settings.warning || defaults.warning }}>
                  تحذير
                </div>
                <div className="p-4 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: settings.danger || defaults.danger }}>
                  خطأ
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
