import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { getSubjects, getTracks } from '@/api/queries'
import type { Track, Subject } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function TrackDetail() {
  const { trackId } = useParams<{ trackId: string }>()
  const [track, setTrack] = useState<Track | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [tracks, subjectsData] = await Promise.all([getTracks(), getSubjects(trackId)])
      setTrack(tracks.find(t => t.id === trackId) || null)
      setSubjects(subjectsData)
      setLoading(false)
    }
    load()
  }, [trackId])

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--text,#0f172a)]/40 mb-6">
        <Link to="/" className="hover:text-[var(--primary,#2563eb)] transition-colors">الرئيسية</Link>
        <span>/</span>
        <span className="text-[var(--text,#0f172a)]">{track?.name || 'الشعبة'}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-8 mb-8 text-white"
        style={track ? { background: `linear-gradient(135deg, ${track.gradient_start || '#1e40af'}, ${track.gradient_end || '#7c3aed'})` } : {}}
      >
        <h1 className="text-3xl font-bold mb-2">{track?.name || 'جاري التحميل...'}</h1>
        <p className="text-white/70">{track?.description}</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-[var(--text,#0f172a)]/20 mx-auto mb-4" />
          <p className="text-lg text-[var(--text,#0f172a)]/40">لا توجد مواد متاحة في هذه الشعبة</p>
        </div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {subjects.map(subject => (
            <motion.div key={subject.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Link to={`/subject/${subject.id}`} className="group block">
                <div className="rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] p-6 hover:shadow-lg hover:border-[var(--primary,#2563eb)]/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                    style={{ backgroundColor: `${subject.color || '#3b82f6'}15` }}>
                    {subject.icon || <BookOpen className="w-6 h-6" style={{ color: subject.color || '#3b82f6' }} />}
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text,#0f172a)] mb-1">{subject.name}</h3>
                  {subject.description && <p className="text-sm text-[var(--text,#0f172a)]/40 line-clamp-2">{subject.description}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
