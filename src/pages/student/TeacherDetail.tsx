import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, GraduationCap, Send, MessageCircle, Video, Globe } from 'lucide-react'
import { getTeachers, getCourses } from '@/api/queries'
import type { Teacher, Course } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

export default function TeacherDetail() {
  const { teacherId } = useParams<{ teacherId: string }>()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [allTeachers, coursesData] = await Promise.all([getTeachers(), getCourses(teacherId)])
      setTeacher(allTeachers.find(t => t.id === teacherId) || null)
      setCourses(coursesData)
      setLoading(false)
    }
    load()
  }, [teacherId])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 rounded-3xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-32 mt-2" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!teacher) {
    return <div className="text-center py-16"><p className="text-lg text-[var(--text,#0f172a)]/40">المدرس غير موجود</p></div>
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-[var(--text,#0f172a)]/40 mb-6">
        <Link to="/" className="hover:text-[var(--primary,#2563eb)]">الرئيسية</Link>
        <span>/</span>
        <Link to={`/subject/${teacher.subject_id}`} className="hover:text-[var(--primary,#2563eb)]">{teacher.subject?.name}</Link>
        <span>/</span>
        <span className="text-[var(--text,#0f172a)]">{teacher.name}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)]"
      >
        {teacher.cover && (
          <div className="h-48 sm:h-64 overflow-hidden">
            <img src={teacher.cover} alt="" className="w-full h-full object-cover opacity-30" />
          </div>
        )}
        <div className={`${teacher.cover ? '-mt-20' : ''} px-6 sm:px-8 pb-8 relative`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6">
            {teacher.photo ? (
              <img src={teacher.photo} alt={teacher.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl object-cover" />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-white" />
              </div>
            )}
            <div className="flex-1 pt-2 sm:pt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{teacher.name}</h1>
              <p className="text-white/70 mt-1">{teacher.subject?.name}</p>
              {teacher.rating > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm">{teacher.rating}</span>
                </div>
              )}
            </div>
            {teacher.telegram && (
              <a href={teacher.telegram} target="_blank" className="text-white/70 hover:text-white">
                <Send className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {teacher.bio && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[var(--border,#e2e8f0)] bg-[var(--card,#f8fafc)] p-6 mb-8"
        >
          <h2 className="font-semibold text-[var(--text,#0f172a)] mb-2">عن المدرس</h2>
          <p className="text-sm text-[var(--text,#0f172a)]/60 leading-relaxed">{teacher.bio}</p>
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-8">
        {teacher.facebook && <a href={teacher.facebook} target="_blank" className="p-3 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"><Globe className="w-4 h-4" /></a>}
        {teacher.telegram && <a href={teacher.telegram} target="_blank" className="p-3 rounded-xl bg-sky-100 text-sky-600 hover:bg-sky-200 transition-colors"><Send className="w-4 h-4" /></a>}
        {teacher.whatsapp && <a href={teacher.whatsapp} target="_blank" className="p-3 rounded-xl bg-green-100 text-green-600 hover:bg-green-200 transition-colors"><MessageCircle className="w-4 h-4" /></a>}
        {teacher.youtube && <a href={teacher.youtube} target="_blank" className="p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><Video className="w-4 h-4" /></a>}
      </div>

      <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}>
        <h2 className="text-xl font-bold text-[var(--text,#0f172a)] mb-4">الكورسات المتاحة</h2>
        {courses.length === 0 ? (
          <p className="text-[var(--text,#0f172a)]/40 py-8 text-center">لا توجد كورسات متاحة حالياً</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map(course => (
              <motion.div key={course.id} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <Link to={`/course/${course.id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary,#2563eb)] to-[var(--secondary,#7c3aed)] flex items-center justify-center shrink-0">
                          {course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover" /> : <GraduationCap className="w-8 h-8 text-white/50" />}
                        </div>
                        <div className="p-4 flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--text,#0f172a)] truncate">{course.name}</h3>
                          {course.description && <p className="text-xs text-[var(--text,#0f172a)]/40 mt-1 line-clamp-2">{course.description}</p>}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-[var(--primary,#2563eb)]">{formatCurrency(course.price)}</span>
                            <Button variant="primary" size="xs" asChild><span>شراء</span></Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
