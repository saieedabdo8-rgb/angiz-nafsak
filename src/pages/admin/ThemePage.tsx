import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Palette, RotateCcw, Save, Eye, ChevronDown, ChevronUp, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useTheme } from '@/contexts/ThemeContext'
import toast from 'react-hot-toast'

interface ThemePreset {
  name: string
  colors: Record<string, string>
}

const presets: ThemePreset[] = [
  {
    name: 'احترافي أزرق',
    colors: {
      primary: '#2563EB', secondary: '#3B82F6', accent: '#7C3AED',
      background: '#F8FAFC', card: '#FFFFFF', surface: '#FFFFFF',
      text: '#0F172A', secondary_text: '#64748B', border: '#E2E8F0',
      success: '#16A34A', warning: '#F59E0B', danger: '#DC2626', info: '#0891B2',
      header_bg: '#FFFFFF', sidebar_bg: '#FFFFFF', footer_bg: '#1E293B',
      hero_bg: '#1E40AF', button_bg: '#2563EB', button_hover: '#1D4ED8', button_text: '#FFFFFF',
    },
  },
  {
    name: 'زمردي',
    colors: {
      primary: '#059669', secondary: '#10B981', accent: '#34D399',
      background: '#F8FAFC', card: '#FFFFFF', surface: '#FFFFFF',
      text: '#0F172A', secondary_text: '#64748B', border: '#E2E8F0',
      success: '#16A34A', warning: '#F59E0B', danger: '#DC2626', info: '#0891B2',
      header_bg: '#FFFFFF', sidebar_bg: '#FFFFFF', footer_bg: '#065F46',
      hero_bg: '#047857', button_bg: '#059669', button_hover: '#047857', button_text: '#FFFFFF',
    },
  },
  {
    name: 'بنفسجي ملكي',
    colors: {
      primary: '#7C3AED', secondary: '#8B5CF6', accent: '#A78BFA',
      background: '#FAFAFA', card: '#FFFFFF', surface: '#FFFFFF',
      text: '#0F172A', secondary_text: '#64748B', border: '#E2E8F0',
      success: '#16A34A', warning: '#F59E0B', danger: '#DC2626', info: '#0891B2',
      header_bg: '#FFFFFF', sidebar_bg: '#FFFFFF', footer_bg: '#1E1B4B',
      hero_bg: '#6D28D9', button_bg: '#7C3AED', button_hover: '#6D28D9', button_text: '#FFFFFF',
    },
  },
  {
    name: 'برتقالي غروب',
    colors: {
      primary: '#EA580C', secondary: '#F97316', accent: '#FB923C',
      background: '#FFFBF5', card: '#FFFFFF', surface: '#FFFFFF',
      text: '#0F172A', secondary_text: '#64748B', border: '#E2E8F0',
      success: '#16A34A', warning: '#F59E0B', danger: '#DC2626', info: '#0891B2',
      header_bg: '#FFFFFF', sidebar_bg: '#FFFFFF', footer_bg: '#431407',
      hero_bg: '#C2410C', button_bg: '#EA580C', button_hover: '#C2410C', button_text: '#FFFFFF',
    },
  },
  {
    name: 'بحري غامق',
    colors: {
      primary: '#1E3A8A', secondary: '#2563EB', accent: '#3B82F6',
      background: '#F8FAFC', card: '#FFFFFF', surface: '#FFFFFF',
      text: '#0F172A', secondary_text: '#64748B', border: '#E2E8F0',
      success: '#16A34A', warning: '#F59E0B', danger: '#DC2626', info: '#0891B2',
      header_bg: '#FFFFFF', sidebar_bg: '#FFFFFF', footer_bg: '#0F172A',
      hero_bg: '#1E3A8A', button_bg: '#1E3A8A', button_hover: '#172554', button_text: '#FFFFFF',
    },
  },
]

const colorKeys = [
  { key: 'primary', label: 'اللون الأساسي', section: 'عام' },
  { key: 'secondary', label: 'اللون الثانوي', section: 'عام' },
  { key: 'accent', label: 'لون التمييز', section: 'عام' },
  { key: 'background', label: 'خلفية الصفحة', section: 'الخلفيات' },
  { key: 'surface', label: 'سطح البطاقات', section: 'الخلفيات' },
  { key: 'card', label: 'خلفية البطاقات', section: 'الخلفيات' },
  { key: 'header_bg', label: 'خلفية الهيدر', section: 'الخلفيات' },
  { key: 'sidebar_bg', label: 'خلفية القائمة', section: 'الخلفيات' },
  { key: 'footer_bg', label: 'خلفية الفوتر', section: 'الخلفيات' },
  { key: 'hero_bg', label: 'خلفية الهيرو', section: 'الخلفيات' },
  { key: 'text', label: 'لون النص الأساسي', section: 'النصوص' },
  { key: 'secondary_text', label: 'لون النص الثانوي', section: 'النصوص' },
  { key: 'border', label: 'لون الحدود', section: 'النصوص' },
  { key: 'button_bg', label: 'خلفية الأزرار', section: 'الأزرار' },
  { key: 'button_hover', label: 'خلفية الأزرار (hover)', section: 'الأزرار' },
  { key: 'button_text', label: 'نص الأزرار', section: 'الأزرار' },
  { key: 'success', label: 'نجاح', section: 'الحالات' },
  { key: 'warning', label: 'تحذير', section: 'الحالات' },
  { key: 'danger', label: 'خطأ', section: 'الحالات' },
  { key: 'info', label: 'معلومات', section: 'الحالات' },
]

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
}

export default function ThemePage() {
  const { refreshTheme } = useTheme()
  const [dbColors, setDbColors] = useState<Record<string, string>>({})
  const [localColors, setLocalColors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [recentColors, setRecentColors] = useState<string[]>([])
  const [activeKey, setActiveKey] = useState<string | null>(null)

  function getDefaultColors() {
    return presets[0].colors
  }

  useEffect(() => {
    supabase.from('theme_settings').select('*').then(({ data, error }) => {
      if (error) console.error('ThemePage load error:', error)
      if (data && data.length > 0) {
        const map: Record<string, string> = {}
        for (const row of data) map[row.key] = row.value
        setDbColors(map)
        setLocalColors(map)
      } else {
        setLocalColors(getDefaultColors())
      }
      setLoading(false)
    })
  }, [])

  function applyToDOM(colors: Record<string, string>) {
    const root = document.documentElement
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value)
    }
  }

  function handleColorChange(key: string, value: string) {
    const updated = { ...localColors, [key]: value }
    setLocalColors(updated)
    applyToDOM(updated)

    if (!recentColors.includes(value.toUpperCase())) {
      setRecentColors(prev => [value.toUpperCase(), ...prev].slice(0, 6))
    }
  }

  function applyPreset(preset: ThemePreset) {
    const merged = { ...getDefaultColors(), ...preset.colors }
    setLocalColors(merged)
    applyToDOM(merged)
    toast.success(`تم تطبيق ثيم: ${preset.name}`)
  }

  async function handleSave() {
    setSaving(true)
    const errors: string[] = []
    const entries = Object.entries(localColors)

    for (const [key, value] of entries) {
      const { error } = await supabase.from('theme_settings').upsert(
        { key, value },
        { onConflict: 'key' }
      )
      if (error) {
        console.error(`ThemePage save error for ${key}:`, error)
        errors.push(`${key}: ${error.message}`)
      }
    }

    if (errors.length > 0) {
      toast.error(`فشل حفظ: ${errors[0]}`)
    } else {
      setDbColors({ ...localColors })
      await refreshTheme()
      toast.success('تم حفظ الثيم بنجاح')
    }
    setSaving(false)
  }

  function resetChanges() {
    if (Object.keys(dbColors).length > 0) {
      setLocalColors({ ...dbColors })
      applyToDOM(dbColors)
      toast.success('تم استعادة آخر حفظ')
    } else {
      const d = getDefaultColors()
      setLocalColors(d)
      applyToDOM(d)
      toast.success('تم استعادة الإعدادات الافتراضية')
    }
  }

  async function restoreDefault() {
    const d = getDefaultColors()
    setLocalColors(d)
    applyToDOM(d)

    const { error } = await supabase.from('theme_settings').delete().neq('key', '')
    if (error) console.error('ThemePage restore error:', error)

    for (const [key, value] of Object.entries(d)) {
      await supabase.from('theme_settings').upsert({ key, value }, { onConflict: 'key' })
    }

    setDbColors(d)
    await refreshTheme()
    toast.success('تم استعادة الثيم الافتراضي')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[var(--primary,#2563eb)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const groupedKeys = colorKeys.reduce<Record<string, typeof colorKeys>>((acc, k) => {
    if (!acc[k.section]) acc[k.section] = []
    acc[k.section].push(k)
    return acc
  }, {})

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text,#0f172a)] tracking-tight">مدير الثيم</h1>
          <p className="text-sm text-[var(--secondary-text,#64748b)] mt-1">اختر من القوالب الجاهزة أو خصص الألوان بنفسك</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetChanges}>
            <RotateCcw className="w-4 h-4" />استعادة
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />حفظ الثيم
          </Button>
        </div>
      </div>

      {/* Preset Themes */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[var(--text,#0f172a)] mb-5">قوالب جاهزة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {presets.map((preset) => {
            const isActive = Object.entries(preset.colors).every(
              ([k, v]) => localColors[k] === v
            )
            return (
              <motion.button
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyPreset(preset)}
                className={`relative rounded-2xl border-2 p-5 text-right transition-all duration-300 ${
                  isActive
                    ? 'border-[var(--primary,#2563eb)] shadow-lg shadow-[var(--primary,#2563eb)]/10'
                    : 'border-[var(--border,#e2e8f0)] hover:border-[var(--border,#e2e8f0)] hover:shadow-md'
                } bg-[var(--surface,#ffffff)]`}
              >
                {isActive && (
                  <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[var(--primary,#2563eb)] flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                {/* Color preview row */}
                <div className="flex gap-1.5 mb-3">
                  {['primary', 'accent', 'success', 'warning', 'danger'].map((k) => (
                    <div
                      key={k}
                      className="w-6 h-6 rounded-lg border border-[var(--border,#e2e8f0)]"
                      style={{ backgroundColor: preset.colors[k] }}
                    />
                  ))}
                </div>
                <p className="font-medium text-sm text-[var(--text,#0f172a)]">{preset.name}</p>
                <p className="text-xs text-[var(--secondary-text,#64748b)] mt-0.5">
                  {Object.keys(preset.colors).length} لون
                </p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Custom Theme Toggle */}
      <button
        onClick={() => setCustomOpen(!customOpen)}
        className="w-full flex items-center justify-between p-5 rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--surface,#ffffff)] hover:shadow-sm transition-all mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary,#2563eb)]/10 flex items-center justify-center">
            <Palette className="w-5 h-5 text-[var(--primary,#2563eb)]" />
          </div>
          <div className="text-right">
            <p className="font-medium text-[var(--text,#0f172a)]">تخصيص الألوان</p>
            <p className="text-xs text-[var(--secondary-text,#64748b)]">عدّل كل لون في الموقع يدوياً</p>
          </div>
        </div>
        {customOpen ? <ChevronUp className="w-5 h-5 text-[var(--secondary-text)]" /> : <ChevronDown className="w-5 h-5 text-[var(--secondary-text)]" />}
      </button>

      <AnimatePresence>
        {customOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Color Groups */}
              <div className="space-y-6">
                {Object.entries(groupedKeys).map(([section, keys]) => (
                  <Card key={section}>
                    <CardContent className="p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-[var(--text,#0f172a)]">{section}</h3>
                      {keys.map(({ key, label }) => (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs text-[var(--secondary-text,#64748b)]">{label}</label>
                            <span className="text-xs font-mono text-[var(--secondary-text,#64748b)]" dir="ltr">
                              {localColors[key] || getDefaultColors()[key]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setActiveKey(activeKey === key ? null : key)}
                              className="w-10 h-10 rounded-xl border-2 border-[var(--border,#e2e8f0)] flex-shrink-0 transition-transform hover:scale-105"
                              style={{ backgroundColor: localColors[key] || getDefaultColors()[key] }}
                            />
                            {activeKey === key && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative"
                              >
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50">
                                  <div className="bg-[var(--surface,#ffffff)] rounded-2xl shadow-xl border border-[var(--border,#e2e8f0)] p-4">
                                    <input
                                      type="color"
                                      value={localColors[key] || getDefaultColors()[key]}
                                      onChange={(e) => handleColorChange(key, e.target.value)}
                                      className="w-48 h-48 rounded-xl cursor-pointer block"
                                    />
                                    <div className="mt-3 space-y-2">
                                      <Input
                                        value={(localColors[key] || getDefaultColors()[key]).toUpperCase()}
                                        onChange={(e) => {
                                          const v = e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value
                                          if (/^#[0-9A-Fa-f]{6}$/.test(v)) handleColorChange(key, v)
                                        }}
                                        className="text-xs font-mono text-center"
                                        dir="ltr"
                                      />
                                      {(() => {
                                        const rgb = hexToRgb(localColors[key] || getDefaultColors()[key])
                                        return (
                                          <p className="text-xs text-center text-[var(--secondary-text,#64748b)]" dir="ltr">
                                            RGB({rgb.r}, {rgb.g}, {rgb.b})
                                          </p>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                            <Input
                              value={(localColors[key] || getDefaultColors()[key]).toUpperCase()}
                              onChange={(e) => {
                                let v = e.target.value
                                if (v.startsWith('#')) handleColorChange(key, v.toUpperCase())
                                else handleColorChange(key, '#' + v.toUpperCase())
                              }}
                              className="flex-1 text-xs font-mono h-10"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Live Preview */}
              <div className="lg:sticky lg:top-24 self-start">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-5">
                      <Eye className="w-4 h-4 text-[var(--secondary-text,#64748b)]" />
                      <h3 className="text-sm font-semibold text-[var(--text,#0f172a)]">معاينة حية</h3>
                    </div>

                    <div
                      className="rounded-2xl border p-6 space-y-4 transition-colors duration-300"
                      style={{ backgroundColor: localColors.background || getDefaultColors().background, borderColor: localColors.border || getDefaultColors().border }}
                    >
                      <div
                        className="rounded-xl p-5 transition-colors duration-300"
                        style={{ backgroundColor: localColors.card || getDefaultColors().card, border: `1px solid ${localColors.border || getDefaultColors().border}` }}
                      >
                        <h4 className="text-lg font-semibold mb-1 transition-colors duration-300" style={{ color: localColors.text || getDefaultColors().text }}>
                          نص تجريبي
                        </h4>
                        <p className="text-sm mb-4 transition-colors duration-300" style={{ color: localColors.secondary_text || getDefaultColors().secondary_text }}>
                          هذا النص التجريبي يعرض الألوان الحالية. التعديل يظهر فوراً.
                        </p>
                        <div className="flex gap-3">
                          <button
                            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                            style={{ backgroundColor: localColors.button_bg || getDefaultColors().button_bg, color: localColors.button_text || getDefaultColors().button_text }}
                          >
                            زر رئيسي
                          </button>
                          <button
                            className="px-5 py-2.5 rounded-xl text-sm font-medium border transition-all"
                            style={{ borderColor: localColors.border || getDefaultColors().border, color: localColors.text || getDefaultColors().text }}
                          >
                            زر ثانوي
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {(['success', 'warning', 'danger', 'info'] as const).map((s) => (
                          <div
                            key={s}
                            className="flex-1 h-12 rounded-xl flex items-center justify-center text-white text-xs font-medium transition-colors duration-300"
                            style={{ backgroundColor: localColors[s] || getDefaultColors()[s] }}
                          >
                            {s === 'success' ? 'نجاح' : s === 'warning' ? 'تحذير' : s === 'danger' ? 'خطأ' : 'معلومات'}
                          </div>
                        ))}
                      </div>

                      <div
                        className="rounded-xl p-4 transition-colors duration-300"
                        style={{ background: `linear-gradient(135deg, ${localColors.primary || getDefaultColors().primary}, ${localColors.accent || getDefaultColors().accent})` }}
                      >
                        <p className="text-white text-sm font-medium">تدرج من الأساسي إلى لون التمييز</p>
                      </div>
                    </div>

                    {recentColors.length > 0 && (
                      <div className="mt-5">
                        <p className="text-xs text-[var(--secondary-text,#64748b)] mb-2">الألوان المستخدمة مؤخراً</p>
                        <div className="flex gap-2 flex-wrap">
                          {recentColors.map((c, i) => (
                            <button
                              key={i}
                              className="w-8 h-8 rounded-lg border border-[var(--border,#e2e8f0)] transition-transform hover:scale-110"
                              style={{ backgroundColor: c }}
                              title={c}
                              onClick={() => {
                                if (activeKey) handleColorChange(activeKey, c)
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-[var(--border,#e2e8f0)]">
                      <Button variant="outline" onClick={restoreDefault} className="w-full">
                        <X className="w-4 h-4" />استعادة الثيم الافتراضي
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
