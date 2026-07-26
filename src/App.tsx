import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import StudentLayout from '@/layouts/StudentLayout'
import AdminLayout from '@/layouts/AdminLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Home from '@/pages/student/Home'
import SearchResults from '@/pages/student/SearchResults'
import TrackDetail from '@/pages/student/TrackDetail'
import SubjectTeachers from '@/pages/student/SubjectTeachers'
import TeacherDetail from '@/pages/student/TeacherDetail'
import CourseDetail from '@/pages/student/CourseDetail'
import Purchases from '@/pages/student/Purchases'
import Profile from '@/pages/student/Profile'
import AdminDashboard from '@/pages/admin/Dashboard'
import StudentsPage from '@/pages/admin/StudentsPage'
import TracksPage from '@/pages/admin/TracksPage'
import SubjectsPage from '@/pages/admin/SubjectsPage'
import TeachersPage from '@/pages/admin/TeachersPage'
import CoursesPage from '@/pages/admin/CoursesPage'
import CodesPage from '@/pages/admin/CodesPage'
import OrdersPage from '@/pages/admin/OrdersPage'
import PurchasesPage from '@/pages/admin/PurchasesPage'
import ThemePage from '@/pages/admin/ThemePage'
import SettingsPage from '@/pages/admin/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-center" toastOptions={{
            style: {
              borderRadius: '12px',
              background: 'var(--card)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              direction: 'rtl',
            }
          }} />
          <Routes>
            {/* Home (public) */}
            <Route path="/" element={<StudentLayout />}>
              <Route index element={<Home />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="track/:trackId" element={<ProtectedRoute><TrackDetail /></ProtectedRoute>} />
              <Route path="subject/:subjectId" element={<ProtectedRoute><SubjectTeachers /></ProtectedRoute>} />
              <Route path="teacher/:teacherId" element={<ProtectedRoute><TeacherDetail /></ProtectedRoute>} />
              <Route path="course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="tracks" element={<TracksPage />} />
              <Route path="subjects" element={<SubjectsPage />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="codes" element={<CodesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="theme" element={<ThemePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
