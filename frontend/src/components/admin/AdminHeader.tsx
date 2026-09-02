import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronRight, Sun, Moon, Monitor, Globe, ChevronDown } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { cn } from '@/utils/helpers';

interface AdminHeaderProps {
  onMenuClick: () => void;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

export default function AdminHeader({ onMenuClick, breadcrumbs }: AdminHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      localStorage.setItem('dv-lang', lng);
      setLangOpen(false);
    },
    [i18n]
  );

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  const themes = [
    { value: 'light' as const, label: t('themes.light'), icon: Sun },
    { value: 'bright' as const, label: t('themes.bright'), icon: Moon },
    { value: 'system' as const, label: t('themes.system'), icon: Monitor },
  ];

  const ThemeIcon = themes.find((th) => th.value === theme)?.icon ?? Monitor;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 flex-wrap">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-lg hover:bg-gray-100 text-gray-600 lg:hidden shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Back to app link */}
        <Link
          to="/dashboard"
          className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors shrink-0"
          aria-label={t('admin.backToApp')}
        >
          <ChevronRight size={12} className="text-gray-400 rotate-180" />
          <span className="text-primary-600 font-medium whitespace-nowrap hidden xs:inline">{t('admin.backToApp')}</span>
        </Link>

        {/* Page title */}
        <div className="flex-1 min-w-0">
          <nav className="flex items-center gap-1 text-xs sm:text-sm sm:gap-1.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-gray-300" />}
                {crumb.href ? (
                  <Link to={crumb.href} className="text-gray-500 hover:text-gray-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={i === breadcrumbs.length - 1 ? 'font-semibold text-gray-900' : 'text-gray-500'}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Theme + language switchers */}
        <div ref={switcherRef} className="flex items-center gap-1 shrink-0">
          <div className="relative">
            <button
              onClick={() => { setThemeOpen(!themeOpen); setLangOpen(false); }}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Theme"
            >
              <ThemeIcon size={16} />
            </button>

            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50"
                >
                  {themes.map((th) => (
                    <button
                      key={th.value}
                      onClick={() => { setTheme(th.value); setThemeOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors',
                        theme === th.value
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-700'
                      )}
                    >
                      <th.icon size={14} />
                      {th.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setLangOpen(!langOpen); setThemeOpen(false); }}
              className="flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Globe size={14} />
              <span className="text-xs hidden sm:inline">{i18n.language.toUpperCase()}</span>
              <ChevronDown size={12} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                        i18n.language === lang.code
                          ? 'text-primary-600 font-medium'
                          : 'text-gray-700'
                      )}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
