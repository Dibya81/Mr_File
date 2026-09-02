import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Clock, Users, Settings, Shield } from 'lucide-react';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/helpers';

const mobileNavItems = [
  { path: '/dashboard', labelKey: 'workspace.nav.dashboard', icon: LayoutDashboard },
  { path: '/dashboard/recent', labelKey: 'workspace.nav.recent', icon: Clock },
  { path: '/shared-with-me', labelKey: 'workspace.nav.shared', icon: Users },
  { path: '/settings', labelKey: 'workspace.nav.settings', icon: Settings },
];

export default function WorkspaceMobileNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';
  const user = useAuthStore((s) => s.user);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  const isAdminActive = () => location.pathname.startsWith('/admin');

  const activeBg = isDark ? 'bg-white/[0.08]' : 'bg-gray-100';
  const inactiveBg = 'opacity-60';
  const iconColor = isDark ? 'text-slate-400' : 'text-gray-400';
  const activeIconColor = isDark ? 'text-white' : 'text-gray-900';
  const labelColor = isDark ? 'text-white' : 'text-gray-900';

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t backdrop-blur-xl safe-area-bottom',
        isDark
          ? 'bg-[#090D16]/90 border-white/[0.06]'
          : 'bg-white/90 border-black/[0.06]'
      )}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {mobileNavItems.map(({ path, labelKey, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 min-w-[56px]',
              isActive(path) ? activeBg : inactiveBg
            )}
          >
            <Icon
              size={18}
              className={isActive(path) ? activeIconColor : iconColor}
            />
            <span
              className={cn(
                'text-[10px] font-medium transition-colors',
                isActive(path) ? labelColor : iconColor
              )}
            >
              {t(labelKey)}
            </span>
          </button>
        ))}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 min-w-[56px]',
              isAdminActive() ? activeBg : inactiveBg
            )}
          >
            <Shield
              size={18}
              className={isAdminActive() ? activeIconColor : iconColor}
            />
            <span
              className={cn(
                'text-[10px] font-medium transition-colors',
                isAdminActive() ? labelColor : iconColor
              )}
            >
              {t('admin.section.main')}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
