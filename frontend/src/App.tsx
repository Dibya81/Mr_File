import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';
import { useThemeSync } from './hooks/useThemeSync';
import { ToastContainer } from './components/workspace/ToastContainer';
import './locales/i18n';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import SharedWithMe from './pages/SharedWithMe';
import RecentPage from './pages/RecentPage';
import StarredPage from './pages/StarredPage';
import Settings from './pages/Settings';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminDocumentDetail from './pages/admin/AdminDocumentDetail';
import AdminProcessing from './pages/admin/AdminProcessing';
import AdminSharing from './pages/admin/AdminSharing';
import AdminStorage from './pages/admin/AdminStorage';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminActivity from './pages/admin/AdminActivity';
import CommunityPage from './pages/CommunityPage';
import PublicDocumentPage from './pages/PublicDocumentPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/admin/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  useThemeSync();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/recent" element={<ProtectedRoute><RecentPage /></ProtectedRoute>} />
          <Route path="/dashboard/starred" element={<ProtectedRoute><StarredPage /></ProtectedRoute>} />
          <Route path="/dashboard/folder/:folderId" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/shared-with-me" element={<ProtectedRoute><SharedWithMe /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/dashboard/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />

          {/* Public document page (no auth required) */}
          <Route path="/public/documents/:id" element={<PublicDocumentPage />} />

          {/* Admin control center — nested routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
          <Route path="/admin/documents" element={<AdminRoute><AdminDocuments /></AdminRoute>} />
          <Route path="/admin/documents/:id" element={<AdminRoute><AdminDocumentDetail /></AdminRoute>} />
          <Route path="/admin/processing" element={<AdminRoute><AdminProcessing /></AdminRoute>} />
          <Route path="/admin/sharing" element={<AdminRoute><AdminSharing /></AdminRoute>} />
          <Route path="/admin/storage" element={<AdminRoute><AdminStorage /></AdminRoute>} />
          <Route path="/admin/security" element={<AdminRoute><AdminSecurity /></AdminRoute>} />
          <Route path="/admin/activity" element={<AdminRoute><AdminActivity /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </QueryClientProvider>
  );
}
