import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, School, ShoppingBag,
  QrCode, ClipboardList, ShoppingCart, Palette, Settings,
  LogOut, Menu, ChevronRight, Bell
} from 'lucide-react'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
  { icon: Users, label: 'الطلاب', path: '/admin/students' },
  { icon: GraduationCap, label: 'الشعب الدراسية', path: '/admin/tracks' },
  { icon: BookOpen, label: 'المواد', path: '/admin/subjects' },
  { icon: School, label: 'المدرسون', path: '/admin/teachers' },
  { icon: ShoppingBag, label: 'الكورسات', path: '/admin/courses' },
  { icon: QrCode, label: 'أكواد التفعيل', path: '/admin/codes' },
  { icon: ClipboardList, label: 'الطلبات', path: '/admin/orders' },
  { icon: ShoppingCart, label: 'المشتريات', path: '/admin/purchases' },
  { icon: Palette, label: 'مدير الثيم', path: '/admin/theme' },
  { icon: Settings, label: 'الإعدادات', path: '/admin/settings' },
]

export default function AdminLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAdmin) {
    navigate('/')
    return null
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 z-50 h-full w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">لوحة التحكم</h2>
                <p className="text-xs text-slate-400">أنجز نفسك</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarItems.map(item => {
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-[var(--primary,#2563eb)]/10 text-[var(--primary,#2563eb)]'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 mr-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 w-full transition-colors">
              <LogOut className="w-5 h-5" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="lg:mr-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 relative">
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              </button>
              <Link to="/" className="text-sm text-[var(--primary,#2563eb)] hover:underline">العودة للموقع</Link>
              {profile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center text-white text-xs font-medium">
                    {profile.full_name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{profile.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
