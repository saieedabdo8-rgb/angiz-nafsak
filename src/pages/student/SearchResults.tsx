import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Users, BookOpen, GraduationCap } from 'lucide-react'
import { getTeachers, getSubjects } from '@/api/queries'
import type { Teacher, Subject } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const q = (searchParams.get('q') || '').trim().toLowerCase()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) { setLoading(false); return }
    setLoading(true)
    Promise.all([getTeachers(), getSubjects()]).then(([t, s]) => {
      setTeachers(t.filter(teacher =>
        teacher.name.toLowerCase().includes(q) ||
        teacher.subject?.name.toLowerCase().includes(q)
      ))
      setSubjects(s.filter(subject =>
        subject.name.toLowerCase().includes(q)
      ))
    }).finally(() => setLoading(false))
  }, [q])

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--text,#0f172a)]/40 mb-6">
        <Link to="/" className="hover:text-[var(--primary,#2563eb)]">الرئيسية</Link>
        <span>/</span>
        <span className="text-[var(--text,#0f172a)]">بحث: {q}</span>
      </div>

      {!q ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-[var(--text,#0f172a)]/20 mx-auto mb-4" />
          <p className="text-lg text-[var(--text,#0f172a)]/40">اكتب كلمة للبحث</p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {teachers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[var(--text,#0f172a)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> المدرسون
              </h2>
              <div className="space-y-3">
                {teachers.map(teacher => (
                  <motion.div key={teacher.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link to={`/teacher/${teacher.id}`}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] hover:shadow-md transition-all">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center text-white font-bold">
                        {teacher.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--text,#0f172a)]">{teacher.name}</p>
                        <p className="text-sm text-[var(--text,#0f172a)]/40">{teacher.subject?.name}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {subjects.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[var(--text,#0f172a)] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> المواد
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map(subject => (
                  <motion.div key={subject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Link to={`/subject/${subject.id}`}
                      className="flex items-center gap-3 p-4 rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: subject.color || '#3b82f6' }}>
                        {subject.name.charAt(0)}
                      </div>
                      <span className="font-medium text-[var(--text,#0f172a)]">{subject.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {teachers.length === 0 && subjects.length === 0 && (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-[var(--text,#0f172a)]/20 mx-auto mb-4" />
              <p className="text-lg text-[var(--text,#0f172a)]/40">لا توجد نتائج لـ "{q}"</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
