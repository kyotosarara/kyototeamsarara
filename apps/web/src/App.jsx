import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import PasswordResetPage from '@/pages/PasswordResetPage';
import UserProfilePage from '@/pages/UserProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import AdminDashboard from '@/pages/AdminDashboard';
import UserDashboard from '@/pages/UserDashboard';

// Features
import ArticleListPage from '@/pages/ArticleListPage';
import ArticleDetailPage from '@/pages/ArticleDetailPage';
import ArticleCreatePage from '@/pages/ArticleCreatePage';
import ArticleEditPage from '@/pages/ArticleEditPage';
import CalendarPage from '@/pages/CalendarPage';
import PracticeListPage from '@/pages/PracticeListPage';
import PracticeDetailPage from '@/pages/PracticeDetailPage';
import EventListPage from '@/pages/EventListPage';
import EventDetailPage from '@/pages/EventDetailPage';
import NotificationListPage from '@/pages/NotificationListPage';
import NotificationDetailPage from '@/pages/NotificationDetailPage';
import NotificationSendPage from '@/pages/NotificationSendPage';
import HPLinksPage from '@/pages/HPLinksPage';
import VLOGListPage from '@/pages/VLOGListPage';
import VLOGDetailPage from '@/pages/VLOGDetailPage';
import VLOGUploadPage from '@/pages/VLOGUploadPage';
import AdminEmailsPage from '@/pages/AdminEmailsPage';

// Operations
import OperationsLayout from '@/components/OperationsLayout';
import VibrDropProgressPage from '@/pages/VibrDropProgressPage';
import BudgetListPage from '@/pages/BudgetListPage';
import BudgetDetailPage from '@/pages/BudgetDetailPage';
import EquipmentListPage from '@/pages/EquipmentListPage';
import StaffListPage from '@/pages/StaffListPage';
import EventProcessPage from '@/pages/EventProcessPage';

// Root Router Component to handle role-based dashboard routing
const RootRoute = () => {
  const { isAuthenticated, currentUser, initialLoading } = useAuth();
  
  if (initialLoading) return <div className="min-h-screen flex items-center justify-center">読み込み中...</div>;
  
  if (!isAuthenticated) {
    return <HomePage />;
  }
  
  if (currentUser?.role === '三役' || currentUser?.role === 'スタッフ') {
    return <AdminDashboard />;
  }
  
  return <UserDashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          
          {/* Root Route handles HomePage vs Dashboards */}
          <Route path="/" element={<RootRoute />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Features */}
          <Route path="/articles" element={<ProtectedRoute><ArticleListPage /></ProtectedRoute>} />
          <Route path="/articles/create" element={<ProtectedRoute allowedRoles={['三役', 'スタッフ']}><ArticleCreatePage /></ProtectedRoute>} />
          <Route path="/articles/:id" element={<ProtectedRoute><ArticleDetailPage /></ProtectedRoute>} />
          <Route path="/articles/:id/edit" element={<ProtectedRoute allowedRoles={['三役', 'スタッフ']}><ArticleEditPage /></ProtectedRoute>} />
          
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/practices" element={<ProtectedRoute><PracticeListPage /></ProtectedRoute>} />
          <Route path="/practices/:id" element={<ProtectedRoute><PracticeDetailPage /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><EventListPage /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
          
          <Route path="/notifications" element={<ProtectedRoute><NotificationListPage /></ProtectedRoute>} />
          <Route path="/notifications/:id" element={<ProtectedRoute><NotificationDetailPage /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['三役', 'スタッフ']}><NotificationSendPage /></ProtectedRoute>} />
          
          <Route path="/hp-links" element={<ProtectedRoute><HPLinksPage /></ProtectedRoute>} />
          <Route path="/links" element={<Navigate to="/hp-links" replace />} />
          
          <Route path="/vlogs" element={<ProtectedRoute><VLOGListPage /></ProtectedRoute>} />
          <Route path="/vlogs/:id" element={<ProtectedRoute><VLOGDetailPage /></ProtectedRoute>} />
          <Route path="/vlog/upload" element={<ProtectedRoute><VLOGUploadPage /></ProtectedRoute>} />
          <Route path="/videos" element={<Navigate to="/vlogs" replace />} />

          <Route path="/admin/emails" element={<ProtectedRoute allowedRoles={['三役']}><AdminEmailsPage /></ProtectedRoute>} />

          {/* Operations Area */}
          <Route path="/operations" element={<ProtectedRoute allowedRoles={['三役', 'スタッフ']}><OperationsLayout /></ProtectedRoute>}>
            <Route path="progress" element={<VibrDropProgressPage />} />
            <Route path="budget" element={<BudgetListPage />} />
            <Route path="budget/:id" element={<BudgetDetailPage />} />
            <Route path="equipment" element={<EquipmentListPage />} />
            <Route path="staff" element={<StaffListPage />} />
            <Route path="meetings" element={<div>準備中</div>} />
          </Route>
          
          <Route path="/event-process/:eventId" element={<ProtectedRoute allowedRoles={['三役', 'スタッフ']}><EventProcessPage /></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center flex-col"><h1 className="text-4xl font-bold mb-4">404</h1><p>ページが見つかりません</p><a href="/" className="text-primary mt-4 hover:underline">ホームに戻る</a></div>} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;