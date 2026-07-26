import { supabase } from '@/lib/supabase'
import type { Track, Subject, Teacher, Course, Code, Order, Payment, Purchase, Profile, TrackSubject } from '@/types'

// --- TRACKS ---
export async function getTracks(): Promise<Track[]> {
  const { data } = await supabase.from('tracks').select('*').eq('status', 'active').order('display_order')
  return data ?? []
}

export async function getAllTracks(): Promise<Track[]> {
  const { data } = await supabase.from('tracks').select('*').order('display_order')
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
    const { data: trackSubjects } = await supabase.from('track_subjects').select('subject_id').eq('track_id', trackId)
    if (trackSubjects?.length) {
      query = supabase.from('subjects').select('*').eq('status', 'active')
        .in('id', trackSubjects.map(ts => ts.subject_id)).order('display_order')
    }
  }
  const { data } = await query
  return data ?? []
}

export async function getAllSubjects(): Promise<Subject[]> {
  const { data } = await supabase.from('subjects').select('*').order('display_order')
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
  const { data } = await supabase.from('track_subjects').select('*').eq('track_id', trackId)
  return data ?? []
}

export async function setTrackSubjects(trackId: string, subjectIds: string[]) {
  await supabase.from('track_subjects').delete().eq('track_id', trackId)
  if (subjectIds.length) {
    const rows = subjectIds.map(subject_id => ({ track_id: trackId, subject_id }))
    return supabase.from('track_subjects').insert(rows)
  }
}

// --- TEACHERS ---
export async function getTeachers(subjectId?: string): Promise<(Teacher & { subject?: Subject; track?: Track })[]> {
  let query = supabase.from('teachers').select('*, subject:subjects(*), track:tracks(*)').eq('status', 'active').order('display_order')
  if (subjectId) query = query.eq('subject_id', subjectId)
  const { data } = await query
  return data ?? []
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const { data } = await supabase.from('teachers').select('*, subject:subjects(*), track:tracks(*)').order('display_order')
  return data ?? []
}

export async function createTeacher(teacher: Partial<Teacher>) {
  return supabase.from('teachers').insert(teacher).select().single()
}

export async function updateTeacher(id: string, updates: Partial<Teacher>) {
  return supabase.from('teachers').update(updates).eq('id', id).select().single()
}

export async function deleteTeacher(id: string) {
  return supabase.from('teachers').delete().eq('id', id)
}

// --- COURSES ---
export async function getCourses(teacherId?: string): Promise<(Course & { teacher?: Teacher; track?: Track; subject?: Subject })[]> {
  let query = supabase.from('courses').select('*, teacher:teachers(*), track:tracks(*), subject:subjects(*)').eq('status', 'active').order('created_at', { ascending: false })
  if (teacherId) query = query.eq('teacher_id', teacherId)
  const { data } = await query
  return data ?? []
}

export async function getAllCourses(): Promise<Course[]> {
  const { data } = await supabase.from('courses').select('*, teacher:teachers(*), track:tracks(*), subject:subjects(*)').order('created_at', { ascending: false })
  return data ?? []
}

export async function getCourse(id: string): Promise<Course & { teacher?: Teacher; track?: Track; subject?: Subject }> {
  const { data } = await supabase.from('courses').select('*, teacher:teachers(*), track:tracks(*), subject:subjects(*)').eq('id', id).single()
  return data
}

export async function createCourse(course: Partial<Course>) {
  return supabase.from('courses').insert(course).select().single()
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  return supabase.from('courses').update(updates).eq('id', id).select().single()
}

export async function deleteCourse(id: string) {
  return supabase.from('courses').delete().eq('id', id)
}

// --- CODES ---
export async function getCodes(courseId: string): Promise<Code[]> {
  const { data } = await supabase.from('codes').select('*').eq('course_id', courseId).order('created_at')
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
  const { data } = await supabase.from('orders').select('*, course:courses(*), teacher:teachers(*)')
    .eq('student_id', studentId).order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllOrders(): Promise<(Order & { student?: Profile; course?: Course; teacher?: Teacher })[]> {
  const { data } = await supabase.from('orders').select('*, student:profiles!student_id(*), course:courses(*), teacher:teachers(*)')
    .order('created_at', { ascending: false })
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
  const { data } = await supabase.from('payments').select('*, order:orders(*, course:courses(*))')
    .eq('student_id', studentId).order('created_at', { ascending: false })
  return data ?? []
}

export async function getAllPayments(): Promise<(Payment & { order?: Order; student?: Profile })[]> {
  const { data } = await supabase.from('payments').select('*, order:orders(*), student:profiles!student_id(*)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function approvePayment(paymentId: string, orderId: string) {
  await supabase.from('payments').update({ status: 'approved' }).eq('id', paymentId)
  await supabase.from('orders').update({ payment_status: 'approved' }).eq('id', orderId)
  const { data } = await supabase.rpc('assign_code', { p_order_id: orderId })
  return data
}

export async function rejectPayment(paymentId: string, orderId: string) {
  await supabase.from('payments').update({ status: 'rejected' }).eq('id', paymentId)
  await supabase.from('orders').update({ payment_status: 'rejected' }).eq('id', orderId)
}

// --- PURCHASES ---
export async function getMyPurchases(studentId: string): Promise<(Purchase & { course?: Course; teacher?: Teacher; code?: Code })[]> {
  const { data } = await supabase.from('purchases').select('*, course:courses(*), teacher:teachers(*), code:codes(*)')
    .eq('student_id', studentId).order('purchased_at', { ascending: false })
  return data ?? []
}

// --- USERS ---
export async function getUsers(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  return data ?? []
}

// --- STORAGE ---
export async function uploadFile(bucket: string, path: string, file: File): Promise<string | null> {
  const { data } = await supabase.storage.from(bucket).upload(path, file)
  if (!data) return null
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
  return publicUrl
}

export async function uploadScreenshot(studentId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const path = `${studentId}/${Date.now()}.${ext}`
  const { data } = await supabase.storage.from('payments').upload(path, file)
  if (!data) return null
  const { data: urlData } = await supabase.storage.from('payments').createSignedUrl(path, 60 * 60 * 24 * 7)
  return urlData?.signedUrl ?? null
}

// --- SETTINGS ---
export async function getSettings(): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('*')
  if (!data) return {}
  const map: Record<string, string> = {}
  for (const row of data) map[row.key] = row.value
  return map
}

export async function updateSetting(key: string, value: string) {
  return supabase.from('settings').upsert({ key, value }, { onConflict: 'key' })
}
