import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
import { getSettings, updateSetting } from '@/api/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface SettingField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'toggle'
  section: string
  placeholder?: string
}

const fields: SettingField[] = [
  { key: 'app_name', label: 'اسم التطبيق', type: 'text', section: 'عام' },
  { key: 'slogan', label: 'الشعار', type: 'text', section: 'عام' },
  { key: 'description', label: 'الوصف', type: 'textarea', section: 'عام' },
  { key: 'contact_phone', label: 'رقم الهاتف', type: 'text', section: 'معلومات الاتصال' },
  { key: 'contact_email', label: 'البريد الإلكتروني', type: 'text', section: 'معلومات الاتصال' },
  { key: 'contact_whatsapp', label: 'رقم WhatsApp', type: 'text', section: 'معلومات الاتصال' },
  { key: 'contact_telegram', label: 'رابط Telegram', type: 'text', section: 'معلومات الاتصال' },
  { key: 'contact_facebook', label: 'رابط Facebook', type: 'text', section: 'معلومات الاتصال' },
  { key: 'seo_title', label: 'عنوان SEO', type: 'text', section: 'SEO' },
  { key: 'seo_description', label: 'وصف SEO', type: 'textarea', section: 'SEO' },
  { key: 'seo_keywords', label: 'كلمات مفتاحية', type: 'text', section: 'SEO', placeholder: 'مفتاحية1, مفتاحية2' },
  { key: 'enable_registration', label: 'تفعيل التسجيل', type: 'toggle', section: 'الميزات' },
  { key: 'enable_comments', label: 'تفعيل التعليقات', type: 'toggle', section: 'الميزات' },
  { key: 'enable_ratings', label: 'تفعيل التقييمات', type: 'toggle', section: 'الميزات' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(data => {
      setSettings(data)
      setLoading(false)
    })
  }, [])

  function handleChange(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const promises = Object.entries(settings).map(([key, value]) =>
      updateSetting(key, value)
    )
    await Promise.all(promises)
    toast.success('تم حفظ الإعدادات')
    setSaving(false)
  }

  const grouped = fields.reduce<Record<string, SettingField[]>>((acc, field) => {
    if (!acc[field.section]) acc[field.section] = []
    acc[field.section].push(field)
    return acc
  }, {})

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary,#2563eb)]" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">الإعدادات</h1>
        <Button onClick={handleSave} loading={saving}><Save className="w-4 h-4" />حفظ الإعدادات</Button>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([section, sectionFields]) => (
          <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{section}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sectionFields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {field.label}
                    </label>
                    {field.type === 'toggle' ? (
                      <label className="inline-flex items-center gap-3 cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" checked={settings[field.key] === 'true'}
                            onChange={e => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                            className="sr-only peer" />
                          <div className="w-11 h-6 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-[var(--primary,#2563eb)] transition-colors" />
                          <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white shadow-sm peer-checked:translate-x-[-1.25rem] transition-transform" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {settings[field.key] === 'true' ? 'مفعل' : 'معطل'}
                        </span>
                      </label>
                    ) : field.type === 'textarea' ? (
                      <textarea value={settings[field.key] || ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        className="w-full rounded-xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 p-4 text-sm text-[var(--text,#0f172a)] resize-none"
                        rows={4} />
                    ) : (
                      <Input value={settings[field.key] || ''}
                        onChange={e => handleChange(field.key, e.target.value)}
                        placeholder={field.placeholder} />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
