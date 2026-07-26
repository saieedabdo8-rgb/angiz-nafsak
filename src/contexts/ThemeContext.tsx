import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
  themeSettings: Record<string, string>
  loading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [themeSettings, setThemeSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  function applyTheme(settings: Record<string, string>) {
    const root = document.documentElement
    for (const [key, value] of Object.entries(settings)) {
      root.style.setProperty(`--${key.replace(/_/g, '-')}`, value)
    }
    root.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    supabase.from('theme_settings').select('*').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) {
          map[row.key] = row.value
        }
        setThemeSettings(map)
        applyTheme({ ...defaults, ...map })
      } else {
        applyTheme(defaults)
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  function toggleTheme() {
    setIsDark(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, themeSettings, loading }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
