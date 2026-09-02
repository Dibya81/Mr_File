import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Settings, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { authApi } from '@/api/auth';
import { cn } from '@/utils/helpers';

interface UserProfileMenuProps {
  onClose?: () => void;
}

export default function UserProfileMenu({ onClose }: UserProfileMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      navigate('/login');
      onClose?.();
    },
  });

  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const sectionLabelColor = isDark ? 'text-slate-500' : 'text-gray-400';
  const iconColor = isDark ? 'text-slate-400' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50';
  const isDarkText = isDark ? 'text-white' : 'text-gray-900';
  const isDarkSubtext = isDark ? 'text-slate-500' : 'text-gray-500';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute bottom-full left-0 right-0 mb-1 rounded-xl border shadow-xl overflow-hidden z-50',
          isDark ? 'bg-[#0B0F19] border-white/[0.08]' : 'bg-white border-black/[0.06]'
        )}
      >
        <div className={cn('px-3 py-3 border-b', borderColor)}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0',
              isDark ? 'bg-white/[0.1] text-white' : 'bg-gray-100 text-gray-700'
            )}>
              {user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium truncate', isDarkText)}>
                {user?.name || user?.username}
              </p>
              <p className={cn('text-xs truncate', isDarkSubtext)}>
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="py-1">
          <button
            onClick={() => { navigate('/settings'); onClose?.(); }}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
              hoverBg, isDarkText
            )}
          >
            <Settings size={14} className={iconColor} />
            <span>{t('workspace.profile.settings')}</span>
          </button>

          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors',
              hoverBg,
              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
            )}
          >
            <LogOut size={14} />
            <span>
              {logoutMutation.isPending ? t('common.signingOut') : t('workspace.profile.logout')}
            </span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
