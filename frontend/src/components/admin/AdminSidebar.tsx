import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Users,
  FileText,
  Cpu,
  Share2,
  HardDrive,
  Shield,
  Activity,
  ChevronLeft,
  LogOut,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { key: 'overview', path: '/admin', icon: LayoutDashboard, end: true },
  { key: 'users', path: '/admin/users', icon: Users, end: false },
  { key: 'documents', path: '/admin/documents', icon: FileText, end: false },
  { key: 'processing', path: '/admin/processing', icon: Cpu, end: false },
  { key: 'sharing', path: '/admin/sharing', icon: Share2, end: false },
  { key: 'storage', path: '/admin/storage', icon: HardDrive, end: false },
  { key: 'security', path: '/admin/security', icon: Shield, end: false },
  { key: 'activity', path: '/admin/activity', icon: Activity, end: false },
] as const;

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          bg-white border-r border-gray-200 shadow-sm
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-30
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{t('admin.title')}</p>
            <p className="text-xs text-gray-500 truncate">{t('admin.section.main')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Back to App — always visible, prominent */}
        <div className="px-3 pt-3 shrink-0">
          <Link
            to="/dashboard"
            onClick={() => onClose()}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{t('admin.backToApp')}</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 scrollbar-thin">
          {navItems.map(({ key, path, icon: Icon, end }) => (
            <NavLink
              key={key}
              to={path}
              end={end}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              <span>{t(`admin.section.${key}`)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
          <div className="flex items-center gap-2.5 mt-2 px-3 py-2">
            <div className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{user?.username}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
