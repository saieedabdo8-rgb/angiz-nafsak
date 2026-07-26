import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, BookOpen, Users, Star, ArrowLeft, GraduationCap, Sparkles } from 'lucide-react'
import { getTracks, getStats } from '@/api/queries'
import type { Track } from '@/types'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [stats, setStats] = useState({ tracks: 0, subjects: 0, teachers: 0, courses: 0, students: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    Promise.all([
      getTracks(),
      getStats(),
    ]).then(([tracksData, statsData]) => {
      setTracks(tracksData)
      setStats(statsData)
    }).catch(err => {
      console.error('Home load error:', err)
    }).finally(() => setLoading(false))
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--hero-bg,#1e40af)] via-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] p-8 sm:p-12 lg:p-16 mb-10 shadow-2xl"
      >
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 ml-1" />
              منصة الطلاب الأولى في مصر
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight"
          >
            أنجز نفسك وابدأ رحلة التفوق
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-8"
          >
            اختر معلمك المفضل من أفضل معلمي الثانوية العامة، واحصل على كود التفعيل فوراً
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث عن معلم أو مادة..."
                className="w-full h-14 pr-12 pl-4 text-base bg-white/15 border-white/20 text-white placeholder:text-white/40 rounded-2xl backdrop-blur-sm focus-visible:ring-white/30"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Tracks Section */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text,#0f172a)]">الشعب الدراسية</h2>
            <p className="text-sm text-[var(--text,#0f172a)]/40 mt-1">اختر شعبتك لعرض المواد والمعلمين</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-[var(--text,#0f172a)]/20 mx-auto mb-4" />
            <p className="text-lg text-[var(--text,#0f172a)]/40">لا توجد شعب دراسية متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map(track => (
              <motion.div key={track.id} variants={item}>
                <Link to={`/track/${track.id}`} className="group block">
                  <div
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-8 h-64 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${track.gradient_start || '#1e40af'}, ${track.gradient_end || '#7c3aed'})`
                    }}
                  >
                    <div className="absolute inset-0 bg-grid-white/10 opacity-50" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      {track.icon && (
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl mb-4">
                          {track.icon}
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-white mb-2">{track.name}</h3>
                      {track.description && (
                        <p className="text-sm text-white/70 line-clamp-2">{track.description}</p>
                      )}
                    </div>

                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-white/60 text-sm">
                        {/* Subject count will be dynamic */}
                      </span>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full group-hover:bg-white/30 transition-all">
                        استكشف
                        <ArrowLeft className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        {[
          { icon: BookOpen, label: 'شعبة دراسية', value: stats.tracks },
          { icon: Star, label: 'مادة', value: stats.subjects },
          { icon: Users, label: 'مدرس', value: stats.teachers },
          { icon: GraduationCap, label: 'كورس', value: stats.courses },
          { icon: Users, label: 'طالب', value: stats.students },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] p-4 sm:p-6 text-center hover:shadow-md transition-shadow">
            <stat.icon className="w-6 h-6 text-[var(--primary,#2563eb)] mx-auto mb-2" />
            <p className="text-2xl font-bold text-[var(--text,#0f172a)]">{stat.value}</p>
            <p className="text-xs text-[var(--text,#0f172a)]/40">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
