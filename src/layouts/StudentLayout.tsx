import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Search, Menu, X, LogOut, User, ShoppingBag, GraduationCap, ChevronDown } from 'lucide-react'

export default function StudentLayout() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border,#e2e8f0)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center shadow-lg shadow-[var(--primary,#2563eb)]/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-[var(--text,#0f172a)] leading-tight">أنجز نفسك</h1>
                <p className="text-[10px] text-[var(--text,#0f172a)]/40 leading-tight">أكواد المعلمين للثانوية العامة</p>
              </div>
            </Link>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(!searchOpen)}>
                <Search className="w-4 h-4" />
                بحث
              </Button>

              {user && profile ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--card,#f8fafc)] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center text-white text-sm font-medium">
                      {profile.full_name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-[var(--text,#0f172a)]">{profile.full_name}</span>
                    <ChevronDown className="w-4 h-4 text-[var(--text,#0f172a)]/40" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 shadow-xl z-20 overflow-hidden">
                        <div className="p-4 border-b border-[var(--border,#e2e8f0)]">
                          <p className="font-medium text-[var(--text,#0f172a)]">{profile.full_name}</p>
                          <p className="text-sm text-[var(--text,#0f172a)]/40">{profile.phone}</p>
                        </div>
                        <div className="p-2">
                          <button onClick={() => { navigate('/purchases'); setProfileOpen(false) }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--card,#f8fafc)] text-sm text-[var(--text,#0f172a)] transition-colors">
                            <ShoppingBag className="w-4 h-4" /> مشترياتي
                          </button>
                          <button onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--card,#f8fafc)] text-sm text-[var(--text,#0f172a)] transition-colors">
                            <User className="w-4 h-4" /> ملفي الشخصي
                          </button>
                          {isAdmin && (
                            <button onClick={() => { navigate('/admin'); setProfileOpen(false) }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--card,#f8fafc)] text-sm text-[var(--primary,#2563eb)] transition-colors">
                              لوحة التحكم
                            </button>
                          )}
                          <hr className="my-1 border-[var(--border,#e2e8f0)]" />
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-[var(--danger,#ef4444)] transition-colors">
                            <LogOut className="w-4 h-4" /> تسجيل خروج
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                  تسجيل الدخول
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[var(--card,#f8fafc)] transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border,#e2e8f0)] bg-white dark:bg-slate-900 p-4 space-y-3">
            <Button variant="ghost" className="w-full justify-start" onClick={() => { setSearchOpen(true); setMenuOpen(false) }}>
              <Search className="w-4 h-4" /> بحث
            </Button>
            {user && profile ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center text-white font-medium">
                    {profile.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{profile.full_name}</p>
                    <p className="text-xs text-[var(--text,#0f172a)]/40">{profile.phone}</p>
                  </div>
                </div>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/purchases'); setMenuOpen(false) }}>
                  <ShoppingBag className="w-4 h-4" /> مشترياتي
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/profile'); setMenuOpen(false) }}>
                  <User className="w-4 h-4" /> ملفي الشخصي
                </Button>
                {isAdmin && (
                  <Button variant="ghost" className="w-full justify-start text-[var(--primary,#2563eb)]" onClick={() => { navigate('/admin'); setMenuOpen(false) }}>
                    لوحة التحكم
                  </Button>
                )}
                <Button variant="danger" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> تسجيل خروج
                </Button>
              </>
            ) : (
              <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                تسجيل الدخول
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')

  return (
    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto mt-20 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-[var(--border,#e2e8f0)] overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[var(--border,#e2e8f0)]">
            <Search className="w-5 h-5 text-[var(--text,#0f172a)]/40" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="ابحث عن معلم أو مادة..."
              className="flex-1 bg-transparent border-none outline-none text-base text-[var(--text,#0f172a)] placeholder:text-[var(--text,#0f172a)]/40"
            />
            <button onClick={onClose} className="text-sm text-[var(--text,#0f172a)]/40 hover:text-[var(--text,#0f172a)]">
              إلغاء
            </button>
          </div>
          {query.length > 0 && (
            <div className="p-4 text-center text-sm text-[var(--text,#0f172a)]/40">
              جاري البحث...
            </div>
          )}
        </div>
      </div>
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
