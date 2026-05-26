import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';

import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { CourseListPage } from './pages/CourseListPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';
import { ShopPage } from './pages/ShopPage';
import { ProfilePage } from './pages/ProfilePage';
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';

import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourses } from './pages/admin/AdminCourses';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminEnrollments } from './pages/admin/AdminEnrollments';
import { ScrollToTop } from './components/ScrollToTop';
import { Footer } from './components/Footer';

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    return initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<><Navbar /><HomePage /><Footer /></>} />
        <Route path="/courses" element={<><Navbar /><CourseListPage /><Footer /></>} />
        <Route path="/courses/:id" element={<><Navbar /><CourseDetailsPage /><Footer /></>} />
        <Route path="/analysis" element={<><Navbar /><AnalysisPage /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/shop" element={<><Navbar /><ShopPage /><Footer /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/__/auth/action" element={<ResetPasswordPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><Navbar /><DashboardPage /><Footer /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Navbar /><ProfilePage /><Footer /></ProtectedRoute>} />
        <Route path="/learn/:courseId/lesson/:lessonId?" element={<ProtectedRoute><Navbar /><LessonPlayerPage /></ProtectedRoute>} />
        <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccessPage /></ProtectedRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoadingAuth } = useAuthStore();
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 border-b-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoadingAuth } = useAuthStore();
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 border-b-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
