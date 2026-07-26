export interface Profile {
  id: string
  full_name: string
  phone: string
  avatar: string | null
  track_id: string | null
  role: 'student' | 'admin'
  created_at: string
  updated_at: string
}

export interface Track {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  background_color: string
  gradient_start: string
  gradient_end: string
  text_color: string
  button_color: string
  display_order: number
  status: 'active' | 'hidden' | 'archived'
  created_at: string
  updated_at: string
}

export interface Subject {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string
  description: string | null
  display_order: number
  status: 'active' | 'hidden' | 'archived'
  created_at: string
  updated_at: string
}

export interface TrackSubject {
  track_id: string
  subject_id: string
}

export interface Teacher {
  id: string
  name: string
  photo: string | null
  cover: string | null
  bio: string | null
  subject_id: string
  track_id: string | null
  experience: string | null
  facebook: string | null
  telegram: string | null
  whatsapp: string | null
  youtube: string | null
  rating: number
  display_order: number
  status: 'active' | 'hidden' | 'archived'
  created_at: string
  updated_at: string
  subject?: Subject
  track?: Track
}

export interface Course {
  id: string
  teacher_id: string
  track_id: string | null
  subject_id: string | null
  name: string
  description: string | null
  price: number
  thumbnail: string | null
  status: 'active' | 'hidden' | 'archived'
  created_at: string
  updated_at: string
  teacher?: Teacher
  track?: Track
  subject?: Subject
}

export interface Code {
  id: string
  course_id: string
  code: string
  status: 'unused' | 'reserved' | 'sold'
  student_id: string | null
  sold_at: string | null
  created_at: string
}

export interface Order {
  id: string
  student_id: string
  course_id: string
  teacher_id: string
  price: number
  payment_method: string | null
  payment_status: 'pending' | 'approved' | 'rejected'
  code_assigned: boolean
  created_at: string
  updated_at: string
  course?: Course
  teacher?: Teacher
}

export interface Payment {
  id: string
  order_id: string
  student_id: string
  amount: number
  method: 'instapay' | 'vodafone_cash'
  screenshot_url: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  order?: Order
}

export interface Purchase {
  id: string
  student_id: string
  course_id: string
  teacher_id: string
  code_id: string
  order_id: string
  price: number
  purchased_at: string
  course?: Course
  teacher?: Teacher
  code?: Code
}

export interface UserTrack {
  student_id: string
  track_id: string
}

export interface ThemeSetting {
  key: string
  value: string
}

export interface Setting {
  key: string
  value: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}
