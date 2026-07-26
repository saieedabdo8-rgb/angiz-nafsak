import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, School, ShoppingBag,
  QrCode, ClipboardList, ShoppingCart, Palette, Settings,
  LogOut, Menu, ChevronLeft,
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background, #f8fafc)' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 z-50 h-full w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: 'var(--sidebar-bg, #ffffff)', borderLeft: '1px solid var(--border, #e2e8f0)' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6" style={{ borderBottom: '1px solid var(--border, #e2e8f0)' }}>
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--primary, #2563eb), var(--accent, #7c3aed))' }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: 'var(--text, #0f172a)' }}>لوحة التحكم</h2>
                <p className="text-xs" style={{ color: 'var(--secondary-text, #64748b)' }}>أنجز نفسك</p>
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
                      ? 'text-[var(--primary,#2563eb)]'
                      : 'hover:bg-[var(--primary,#2563eb)]/5'
                  }`}
                  style={{ color: active ? 'var(--primary, #2563eb)' : 'var(--secondary-text, #64748b)', backgroundColor: active ? 'var(--primary, #2563eb) / 0.08' : 'transparent' }}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {active && <ChevronLeft className="w-4 h-4 mr-auto" style={{ color: 'var(--primary, #2563eb)' }} />}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border, #e2e8f0)' }}>
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition-colors"
              style={{ color: 'var(--danger, #dc2626)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--danger, #dc2626) / 0.08')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <LogOut className="w-5 h-5" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="lg:mr-72">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 transition-colors duration-300"
          style={{ backgroundColor: 'var(--header-bg, #ffffff)', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-black/5 transition-colors">
              <Menu className="w-5 h-5" style={{ color: 'var(--secondary-text, #64748b)' }} />
            </button>

            <div className="flex items-center gap-3">
              <Link to="/" className="text-sm transition-colors" style={{ color: 'var(--primary, #2563eb)' }}>
                العودة للموقع
              </Link>
              {profile && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ backgroundColor: 'var(--primary, #2563eb) / 0.08' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                    style={{ background: 'linear-gradient(135deg, var(--primary, #2563eb), var(--accent, #7c3aed))' }}>
                    {profile.full_name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text, #0f172a)' }}>{profile.full_name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
