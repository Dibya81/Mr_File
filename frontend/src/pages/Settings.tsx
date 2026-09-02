import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, AtSign, Calendar, Lock, Palette,
  Globe, Shield, LogOut, CheckCircle2,
} from 'lucide-react';
import {
  WorkspaceLayout,
  WorkspaceHeader,
} from '@/components/workspace';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { authApi } from '@/api/auth';
import { cn, formatDate } from '@/utils/helpers';

type SettingsTab = 'profile' | 'security' | 'appearance' | 'language' | 'account';

const tabs: { id: SettingsTab; labelKey: string; icon: React.ElementType }[] = [
  { id: 'profile', labelKey: 'workspace.settings.profile', icon: User },
  { id: 'security', labelKey: 'workspace.settings.security', icon: Lock },
  { id: 'appearance', labelKey: 'workspace.settings.appearance', icon: Palette },
  { id: 'language', labelKey: 'workspace.settings.language', icon: Globe },
  { id: 'account', labelKey: 'workspace.settings.account', icon: Shield },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      navigate('/login');
    },
  });

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('dv-lang', lng);
  };

  const borderColor = isDark ? 'border-white/[0.06]' : 'border-gray-100';
  const sectionBg = isDark ? 'bg-white/[0.03]' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';

  const themes = [
    { value: 'light' as const, label: t('themes.light') },
    { value: 'bright' as const, label: t('themes.bright') },
    { value: 'system' as const, label: t('themes.system') },
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full">
        <WorkspaceHeader title={t('workspace.settings.title')} />

        <div className="flex flex-1 min-h-0">
          {/* Sidebar tabs */}
          <aside className={cn(
            'hidden md:flex flex-col w-48 shrink-0 border-r py-6 px-3 gap-1',
            borderColor,
            isDark ? 'bg-[#090D16]' : 'bg-gray-50/50'
          )}>
            {tabs.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === id
                    ? isDark ? 'bg-white/[0.07] text-white' : 'bg-white text-gray-900 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon size={15} />
                {t(labelKey)}
              </button>
            ))}
          </aside>

          {/* Mobile tabs */}
          <div className={cn(
            'md:hidden flex overflow-x-auto gap-1 px-4 py-3 border-b shrink-0',
            borderColor,
            isDark ? 'bg-[#090D16]' : 'bg-gray-50/50'
          )}>
            {tabs.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0',
                  activeTab === id
                    ? isDark ? 'bg-white/[0.07] text-white' : 'bg-white text-gray-900 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                )}
              >
                <Icon size={12} />
                {t(labelKey)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="max-w-xl mx-auto space-y-6">

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className={cn('rounded-2xl border p-6', sectionBg, borderColor)}>
                    <h3 className={cn('text-sm font-semibold mb-4', textSecondary)}>
                      {t('workspace.settings.profile')}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl',
                        isDark ? 'bg-white/[0.08] text-white' : 'bg-gray-100 text-gray-700'
                      )}>
                        {user?.username?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className={cn('font-semibold text-base', textPrimary)}>{user?.name}</p>
                        <p className={cn('text-sm', textMuted)}>@{user?.username}</p>
                        <p className={cn('text-xs capitalize mt-0.5', textMuted)}>{user?.role}</p>
                      </div>
                    </div>
                    <p className={cn('text-xs mt-4', textMuted)}>
                      Profile editing is read-only in this build. Use the admin panel for account updates.
                    </p>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className={cn('rounded-2xl border p-6', sectionBg, borderColor)}>
                    <h3 className={cn('text-sm font-semibold mb-2', textSecondary)}>
                      {t('workspace.settings.security')}
                    </h3>
                    <p className={cn('text-sm', textMuted)}>
                      Password change is not available in this build. Contact an admin if you need to reset your password.
                    </p>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-5">
                  <div className={cn('rounded-2xl border p-6', sectionBg, borderColor)}>
                    <h3 className={cn('text-sm font-semibold mb-4', textSecondary)}>
                      {t('workspace.settings.theme')}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {themes.map((th) => (
                        <button
                          key={th.value}
                          onClick={() => setTheme(th.value)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all',
                            theme === th.value
                              ? isDark
                                ? 'bg-white/[0.08] border-primary-500/40 text-white'
                                : 'bg-primary-50 border-primary-300 text-primary-700'
                              : isDark
                                ? 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <Palette size={18} />
                          {th.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Language Tab */}
              {activeTab === 'language' && (
                <div className="space-y-5">
                  <div className={cn('rounded-2xl border p-6', sectionBg, borderColor)}>
                    <h3 className={cn('text-sm font-semibold mb-4', textSecondary)}>
                      {t('workspace.settings.languageSelect')}
                    </h3>
                    <div className="space-y-2">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                            i18n.language === lang.code
                              ? isDark
                                ? 'bg-white/[0.08] border-primary-500/40 text-white'
                                : 'bg-primary-50 border-primary-300 text-primary-700'
                              : isDark
                                ? 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <span>{lang.label}</span>
                          {i18n.language === lang.code && (
                            <CheckCircle2 size={15} className="text-primary-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-5">
                  <div className={cn('rounded-2xl border p-6', sectionBg, borderColor)}>
                    <h3 className={cn('text-sm font-semibold mb-4', textSecondary)}>
                      Account Info
                    </h3>
                    <div className="space-y-3">
                      <div className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        isDark ? 'bg-white/[0.03]' : 'bg-gray-50'
                      )}>
                        <User size={15} className={textMuted} />
                        <div>
                          <p className={cn('text-xs', textMuted)}>{t('workspace.settings.username')}</p>
                          <p className={cn('text-sm font-medium', textPrimary)}>@{user?.username}</p>
                        </div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        isDark ? 'bg-white/[0.03]' : 'bg-gray-50'
                      )}>
                        <Mail size={15} className={textMuted} />
                        <div>
                          <p className={cn('text-xs', textMuted)}>{t('workspace.settings.email')}</p>
                          <p className={cn('text-sm font-medium', textPrimary)}>{user?.email}</p>
                        </div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        isDark ? 'bg-white/[0.03]' : 'bg-gray-50'
                      )}>
                        <AtSign size={15} className={textMuted} />
                        <div>
                          <p className={cn('text-xs', textMuted)}>Role</p>
                          <p className={cn('text-sm font-medium capitalize', textPrimary)}>{user?.role}</p>
                        </div>
                      </div>
                      <div className={cn(
                        'flex items-center gap-3 p-3 rounded-xl',
                        isDark ? 'bg-white/[0.03]' : 'bg-gray-50'
                      )}>
                        <Calendar size={15} className={textMuted} />
                        <div>
                          <p className={cn('text-xs', textMuted)}>Member since</p>
                          <p className={cn('text-sm font-medium', textPrimary)}>
                            {formatDate(user?.created_at ?? '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign Out */}
                  <div className={cn('rounded-2xl border p-6', isDark ? 'border-white/[0.06] bg-white/[0.03]' : 'border-gray-200 bg-white')}>
                    <h3 className={cn('text-sm font-semibold mb-1', textSecondary)}>
                      {t('workspace.settings.dangerZone')}
                    </h3>
                    <p className={cn('text-xs mb-4', textMuted)}>
                      Sign out of your account. You will need to log in again to access your files.
                    </p>
                    <button
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        'bg-red-500 hover:bg-red-600 text-white',
                        'disabled:opacity-50'
                      )}
                    >
                      <LogOut size={14} />
                      {logoutMutation.isPending ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
