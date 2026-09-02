import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Globe, ChevronDown } from 'lucide-react';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { cn } from '@/utils/helpers';

interface AuthHeaderControlsProps {
  variant?: 'light' | 'dark';
}

export default function AuthHeaderControls({ variant = 'light' }: AuthHeaderControlsProps) {
  const { t, i18n } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('dv-lang', lng);
    setLangOpen(false);
  }, [i18n]);

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

  const isDarkPanel = variant === 'dark';
  const btnHover = isDarkPanel ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100';
  const textColor = isDarkPanel ? 'text-slate-200' : 'text-gray-700';
  const iconColor = isDarkPanel ? 'text-slate-300' : 'text-gray-500';
  const panelBg = isDarkPanel ? 'bg-[#0B0F19] border-white/[0.08]' : 'bg-white border-black/[0.06]';
  const activeText = isDarkPanel ? 'text-blue-400' : 'text-primary-600';
  const itemText = isDarkPanel ? 'text-slate-300' : 'text-gray-700';

  return (
    <div className="flex items-center gap-1">
      <div className="relative">
        <button
          type="button"
          onClick={() => { setThemeOpen(!themeOpen); setLangOpen(false); }}
          className={cn('p-2 rounded-lg transition-colors', btnHover, textColor)}
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
              className={cn(
                'absolute right-0 top-full mt-2 w-40 rounded-xl border shadow-xl py-1 z-50',
                panelBg
              )}
            >
              {themes.map((th) => (
                <button
                  key={th.value}
                  type="button"
                  onClick={() => { setTheme(th.value); setThemeOpen(false); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors',
                    btnHover,
                    theme === th.value ? `${activeText} font-medium` : itemText
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
          type="button"
          onClick={() => { setLangOpen(!langOpen); setThemeOpen(false); }}
          className={cn(
            'flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium transition-colors',
            btnHover, textColor
          )}
        >
          <Globe size={14} className={iconColor} />
          <span className="text-xs hidden sm:inline">{i18n.language.toUpperCase()}</span>
          <ChevronDown size={12} className={iconColor} />
        </button>

        <AnimatePresence>
          {langOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 top-full mt-2 w-36 rounded-xl border shadow-xl py-1 z-50',
                panelBg
              )}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm transition-colors',
                    btnHover,
                    i18n.language === lang.code ? `${activeText} font-medium` : itemText
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
  );
}
