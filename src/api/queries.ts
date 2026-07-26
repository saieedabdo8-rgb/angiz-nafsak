import { supabase } from '@/lib/supabase'
import type { Track, Subject, Teacher, Course, Code, Order, Payment, Purchase, Profile, TrackSubject } from '@/types'

export function handleQueryError(error: unknown, label: string) {
  console.error(`${label} error:`, error)
  return []
}

// --- TRACKS ---
export async function getTracks(): Promise<Track[]> {
  const { data, error } = await supabase.from('tracks').select('*').eq('status', 'active').order('display_order')
  if (error) return handleQueryError(error, 'getTracks') as Track[]
  return data ?? []
}

export async function getAllTracks(): Promise<Track[]> {
  const { data, error } = await supabase.from('tracks').select('*').order('display_order')
  if (error) return handleQueryError(error, 'getAllTracks') as Track[]
  return data ?? []
}

export async function createTrack(track: Partial<Track>) {
  return supabase.from('tracks').insert(track).select().single()
}

export async function updateTrack(id: string, updates: Partial<Track>) {
  return supabase.from('tracks').update(updates).eq('id', id).select().single()
}

export async function deleteTrack(id: string) {
  return supabase.from('tracks').delete().eq('id', id)
}

// --- SUBJECTS ---
export async function getSubjects(trackId?: string): Promise<Subject[]> {
  let query = supabase.from('subjects').select('*').eq('status', 'active').order('display_order')
  if (trackId) {
    const { data: trackSubjects, error: tsError } = await supabase.from('track_subjects').select('subject_id').eq('track_id', trackId)
    if (tsError) return handleQueryError(tsError, 'getSubjects track_subjects') as Subject[]
    if (trackSubjects?.length) {
      query = supabase.from('subjects').select('*').eq('status', 'active')
        .in('id', trackSubjects.map(ts => ts.subject_id)).order('display_order')
    }
  }
  const { data, error } = await query
  if (error) return handleQueryError(error, 'getSubjects') as Subject[]
  return data ?? []
}

export async function getAllSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('display_order')
  if (error) return handleQueryError(error, 'getAllSubjects') as Subject[]
  return data ?? []
}

export async function createSubject(subject: Partial<Subject>) {
  return supabase.from('subjects').insert(subject).select().single()
}

export async function updateSubject(id: string, updates: Partial<Subject>) {
  return supabase.from('subjects').update(updates).eq('id', id).select().single()
}

export async function deleteSubject(id: string) {
  return supabase.from('subjects').delete().eq('id', id)
}

// --- TRACK-SUBJECTS ---
export async function getTrackSubjects(trackId: string): Promise<TrackSubject[]> {
  const { data, error } = await supabase.from('track_subjects').select('*').eq('track_id', trackId)
  if (error) return handleQueryError(error, 'getTrackSubjects') as TrackSubject[]
  return data ?? []
}

export async function setTrackSubjects(trackId: string, subjectIds: string[]) {
  await supabase.from('track_subjects').delete().eq('track_id', trackId)
  if (subjectIds.length) {
    const rows = subjectIds.map(subject_id => ({ track_id: trackId, subject_id }))
    return supabase.from('track_subjects').insert(rows)
  }
  return { error: null }
}

// --- TEACHERS ---
interface TeacherRow extends Omit<Teacher, 'tracks'> {
  tracks?: { track: Track }[]
}

function flattenTeacher(teacher: TeacherRow): Teacher {
  return { ...teacher, tracks: (teacher.tracks || []).map(tt => tt.track) }
}

export async function getTeachers(subjectId?: string): Promise<Teacher[]> {
  let query = supabase.from('teachers').select('*, subject:subjects(*), tracks:teacher_tracks(track:tracks(*))').eq('status', 'active').order('display_order')
  if (subjectId) query = query.eq('subject_id', subjectId)
  const { data, error } = await query
  if (error) return handleQueryError(error, 'getTeachers') as Teacher[]
  return (data ?? [] as unknown as TeacherRow[]).map(flattenTeacher)
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase.from('teachers').select('*, subject:subjects(*), tracks:teacher_tracks(track:tracks(*))').order('display_order')
  if (error) return handleQueryError(error, 'getAllTeachers') as Teacher[]
  return (data ?? [] as unknown as TeacherRow[]).map(flattenTeacher)
}

export async function createTeacher(teacher: Partial<Teacher>) {
  const { track_ids, ...teacherData } = teacher as any
  const { data, error } = await supabase.from('teachers').insert(teacherData).select().single()
  if (error) return { data: null, error }
  if (track_ids?.length) {
    await supabase.from('teacher_tracks').insert(
      track_ids.map((track_id: string) => ({ teacher_id: data.id, track_id }))
    )
  }
  return { data, error: null }
}

export async function updateTeacher(id: string, updates: Partial<Teacher>) {
  const { track_ids, ...teacherData } = updates as any
  const { data, error } = await supabase.from('teachers').update(teacherData).eq('id', id).select().single()
  if (error) return { data: null, error }
  if (track_ids) {
    await supabase.from('teacher_tracks').delete().eq('teacher_id', id)
    if (track_ids.length) {
      await supabase.from('teacher_tracks').insert(
        track_ids.map((track_id: string) => ({ teacher_id: id, track_id }))
      )
    }
  }
  return { data, error: null }
}

export async function deleteTeacher(id: string) {
  await supabase.from('teacher_tracks').delete().eq('teacher_id', id)
  return supabase.from('teachers').delete().eq('id', id)
}

// --- COURSES ---
interface CourseRow extends Omit<Course, 'tracks'> {
  tracks?: { track: Track }[]
}

function flattenCourse(course: CourseRow): Course {
  return { ...course, tracks: (course.tracks || []).map(tt => tt.track) }
}

export async function getCourses(teacherId?: string): Promise<Course[]> {
  let query = supabase.from('courses').select('*, teacher:teachers(*), tracks:course_tracks(track:tracks(*)), subject:subjects(*)').eq('status', 'active').order('created_at', { ascending: false })
  if (teacherId) query = query.eq('teacher_id', teacherId)
  const { data, error } = await query
  if (error) return handleQueryError(error, 'getCourses') as Course[]
  return (data ?? [] as unknown as CourseRow[]).map(flattenCourse)
}

export async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select('*, teacher:teachers(*), tracks:course_tracks(track:tracks(*)), subject:subjects(*)').order('created_at', { ascending: false })
  if (error) return handleQueryError(error, 'getAllCourses') as Course[]
  return (data ?? [] as unknown as CourseRow[]).map(flattenCourse)
}

export async function getCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase.from('courses').select('*, teacher:teachers(*), tracks:course_tracks(track:tracks(*)), subject:subjects(*)').eq('id', id).single()
  if (error) { console.error('getCourse error:', error); return null }
  return data ? flattenCourse(data as unknown as CourseRow) : null
}

export async function createCourse(course: Partial<Course>) {
  const { track_ids, ...courseData } = course as any
  const { data, error } = await supabase.from('courses').insert(courseData).select().single()
  if (error) return { data: null, error }
  if (track_ids?.length) {
    await supabase.from('course_tracks').insert(
      track_ids.map((track_id: string) => ({ course_id: data.id, track_id }))
    )
  }
  return { data, error: null }
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  const { track_ids, ...courseData } = updates as any
  const { data, error } = await supabase.from('courses').update(courseData).eq('id', id).select().single()
  if (error) return { data: null, error }
  if (track_ids) {
    await supabase.from('course_tracks').delete().eq('course_id', id)
    if (track_ids.length) {
      await supabase.from('course_tracks').insert(
        track_ids.map((track_id: string) => ({ course_id: id, track_id }))
      )
    }
  }
  return { data, error: null }
}

export async function deleteCourse(id: string) {
  await supabase.from('course_tracks').delete().eq('course_id', id)
  await supabase.from('orders').delete().eq('course_id', id)
  await supabase.from('codes').delete().eq('course_id', id)
  return supabase.from('courses').delete().eq('id', id)
}

// --- CODES ---
export async function getCodes(courseId: string): Promise<Code[]> {
  const { data, error } = await supabase.from('codes').select('*').eq('course_id', courseId).order('created_at')
  if (error) return handleQueryError(error, 'getCodes') as Code[]
  return data ?? []
}

export async function bulkImportCodes(courseId: string, codes: string[]) {
  const rows = codes.map(code => ({ course_id: courseId, code, status: 'unused' }))
  return supabase.from('codes').insert(rows)
}

export async function addSingleCode(courseId: string, code: string) {
  return supabase.from('codes').insert({ course_id: courseId, code, status: 'unused' }).select().single()
}

export async function deleteCode(id: string) {
  return supabase.from('codes').delete().eq('id', id)
}

// --- ORDERS ---
export async function createOrder(studentId: string, courseId: string, teacherId: string, price: number) {
  return supabase.from('orders').insert({
    student_id: studentId, course_id: courseId,
    teacher_id: teacherId, price, payment_status: 'pending'
  }).select().single()
}

export async function getMyOrders(studentId: string): Promise<(Order & { course?: Course; teacher?: Teacher })[]> {
  const { data, error } = await supabase.from('orders').select('*, course:courses(*), teacher:teachers(*)')
    .eq('student_id', studentId).order('created_at', { ascending: false })
  if (error) return handleQueryError(error, 'getMyOrders') as (Order & { course?: Course; teacher?: Teacher })[]
  return data ?? []
}

export async function getAllOrders(): Promise<(Order & { student?: Profile; course?: Course; teacher?: Teacher })[]> {
  const { data, error } = await supabase.from('orders').select('*, student:profiles!student_id(*), course:courses(*), teacher:teachers(*)')
    .order('created_at', { ascending: false })
  if (error) return handleQueryError(error, 'getAllOrders') as (Order & { student?: Profile; course?: Course; teacher?: Teacher })[]
  return data ?? []
}

export async function updateOrderStatus(id: string, status: string) {
  return supabase.from('orders').update({ payment_status: status }).eq('id', id)
}

// --- PAYMENTS ---
export async function createPayment(orderId: string, studentId: string, amount: number, method: string, screenshotUrl: string) {
  return supabase.from('payments').insert({
    order_id: orderId, student_id: studentId,
    amount, method, screenshot_url: screenshotUrl, status: 'pending'
  }).select().single()
}

export async function getMyPayments(studentId: string): Promise<(Payment & { order?: Order })[]> {
  const { data, error } = await supabase.from('payments').select('*, order:orders(*, course:courses(*))')
    .eq('student_id', studentId).order('created_at', { ascending: false })
  if (error) return handleQueryError(error, 'getMyPayments') as (Payment & { order?: Order })[]
  return data ?? []
}

export async function getAllPayments(): Promise<(Payment & { order?: Order; student?: Profile })[]> {
  const { data, error } = await supabase.from('payments').select('*, order:orders(*), student:profiles!student_id(*)')
    .order('created_at', { ascending: false })
  if (error) return handleQueryError(error, 'getAllPayments') as (Payment & { order?: Order; student?: Profile })[]
  return data ?? []
}

export async function approvePayment(paymentId: string, orderId: string) {
  const { error: pe } = await supabase.from('payments').update({ status: 'approved' }).eq('id', paymentId)
  if (pe) { console.error('approvePayment payment error:', pe); return null }
  const { error: oe } = await supabase.from('orders').update({ payment_status: 'approved' }).eq('id', orderId)
  if (oe) { console.error('approvePayment order error:', oe); return null }
  const { data, error } = await supabase.rpc('assign_code', { p_order_id: orderId })
  if (error) { console.error('approvePayment assign_code error:', error); return null }
  return data
}

export async function rejectPayment(paymentId: string, orderId: string) {
  const { error: pe } = await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId)
  if (pe) console.error('rejectPayment payment error:', pe)
  const { error: oe } = await supabase.from('orders').update({ payment_status: 'rejected' }).eq('id', orderId)
  if (oe) console.error('rejectPayment order error:', oe)
}

// --- PURCHASES ---
export async function getMyPurchases(studentId: string): Promise<(Purchase & { course?: Course; teacher?: Teacher; code?: Code })[]> {
  const { data, error } = await supabase.from('purchases').select('*, course:courses(*), teacher:teachers(*), code:codes(*)')
    .eq('student_id', studentId).order('purchased_at', { ascending: false })
  if (error) return handleQueryError(error, 'getMyPurchases') as (Purchase & { course?: Course; teacher?: Teacher; code?: Code })[]
  return data ?? []
}

// --- STATS ---
export async function getStats(): Promise<{ tracks: number; subjects: number; teachers: number; courses: number; students: number }> {
  const results = await Promise.allSettled([
    supabase.from('tracks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('subjects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('teachers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
  ])
  const getCount = (r: PromiseSettledResult<{ count: number | null; data: unknown; error: unknown }>) =>
    r.status === 'fulfilled' ? (r.value.count ?? 0) : 0
  return {
    tracks: getCount(results[0]),
    subjects: getCount(results[1]),
    teachers: getCount(results[2]),
    courses: getCount(results[3]),
    students: getCount(results[4]),
  }
}

// --- USERS ---
export async function getUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) return handleQueryError(error, 'getUsers') as Profile[]
  return data ?? []
}

// --- STORAGE ---
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) { console.error('uploadFile error:', error); return null }
  if (!data) return null
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

export async function uploadScreenshot(studentId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const path = `${studentId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage.from('payments').upload(path, file)
  if (error) { console.error('uploadScreenshot error:', error); return null }
  if (!data) return null
  const { data: urlData } = await supabase.storage.from('payments').createSignedUrl(path, 60 * 60 * 24 * 7)
  return urlData?.signedUrl ?? null
}

// --- SETTINGS ---
export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('*')
  if (error) { console.error('getSettings error:', error); return {} }
  if (!data) return {}
  const map: Record<string, string> = {}
  for (const row of data) map[row.key] = row.value
  return map
}

export async function updateSetting(key: string, value: string) {
  return supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
}
