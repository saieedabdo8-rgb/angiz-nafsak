import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, BookOpen, GraduationCap } from 'lucide-react'
import { getTeachers, getSubjects } from '@/api/queries'
import type { Subject, Teacher } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function SubjectTeachers() {
  const { subjectId } = useParams<{ subjectId: string }>()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [subjects, teachersData] = await Promise.all([getSubjects(), getTeachers(subjectId)])
      setSubject(subjects.find(s => s.id === subjectId) || null)
      setTeachers(teachersData)
      setLoading(false)
    }
    load()
  }, [subjectId])

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--text,#0f172a)]/40 mb-6">
        <Link to="/" className="hover:text-[var(--primary,#2563eb)]">الرئيسية</Link>
        <span>/</span>
        <span className="text-[var(--text,#0f172a)]">{subject?.name || 'المادة'}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text,#0f172a)]">{subject?.name}</h1>
        <p className="text-[var(--text,#0f172a)]/40 mt-1">{teachers.length} مدرس</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="w-16 h-16 text-[var(--text,#0f172a)]/20 mx-auto mb-4" />
          <p className="text-lg text-[var(--text,#0f172a)]/40">لا يوجد مدرسون لهذه المادة حالياً</p>
        </div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {teachers.map(teacher => (
            <motion.div key={teacher.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Link to={`/teacher/${teacher.id}`} className="group block">
                <div className="rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="aspect-[3/2] bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] relative overflow-hidden">
                    {teacher.photo ? (
                      <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="w-16 h-16 text-white/30" />
                      </div>
                    )}
                    {teacher.rating > 0 && (
                      <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-xs font-medium">{teacher.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-[var(--text,#0f172a)]">{teacher.name}</h3>
                    {teacher.bio && <p className="text-sm text-[var(--text,#0f172a)]/40 mt-1 line-clamp-2">{teacher.bio}</p>}
                    <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text,#0f172a)]/40">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {subject?.name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
