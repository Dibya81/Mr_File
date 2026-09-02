import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import { Menu, X, Globe, Sun, Moon, Monitor, Sparkles } from 'lucide-react';
import StatusPill from './StatusPill';

export default function LandingNavbar() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useThemeStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const changeLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('dv-lang', lng);
    setLangOpen(false);
  };

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

  const ThemeIcon = () => {
    const current = themes.find((th) => th.value === theme);
    if (!current) return null;
    const Icon = current.icon;
    return <Icon size={16} />;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 dark:bg-black/50 backdrop-blur-xl border-b border-black/5 dark:border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-14' : 'h-16'
          }`}
        >
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-glow-sm">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
                DocumentVault
              </span>
            </Link>
            <StatusPill className="hidden sm:inline-flex" />
          </div>

          <div className="hidden md:flex items-center gap-7">
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              {t('nav.howItWorks')}
            </a>
            <a
              href="#security"
              className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              {t('nav.security')}
            </a>
            <a
              href="#features"
              className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              {t('nav.product')}
            </a>

            <div className="relative">
              <button
                onClick={() => {
                  setLangOpen(!langOpen);
                  setThemeOpen(false);
                }}
                className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition"
              >
                <Globe size={14} />
                {i18n.language.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[120px] z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLang(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition ${
                        i18n.language === lang.code
                          ? 'text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setThemeOpen(!themeOpen);
                  setLangOpen(false);
                }}
                className="text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition"
                aria-label="Theme"
              >
                <ThemeIcon />
              </button>
              {themeOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl py-1 min-w-[140px] z-50">
                  {themes.map((th) => (
                    <button
                      key={th.value}
                      onClick={() => {
                        setTheme(th.value);
                        setThemeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition flex items-center gap-2 ${
                        theme === th.value
                          ? 'text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <th.icon size={14} />
                      {th.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/login"
              className="text-sm text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/signup"
              className="shine-button inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition shadow-glow-sm"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-gray-700 dark:text-slate-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 px-4 py-4 space-y-3">
          <a
            href="#how-it-works"
            className="block text-sm text-gray-700 dark:text-slate-200 py-2"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.howItWorks')}
          </a>
          <a
            href="#security"
            className="block text-sm text-gray-700 dark:text-slate-200 py-2"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.security')}
          </a>
          <a
            href="#features"
            className="block text-sm text-gray-700 dark:text-slate-200 py-2"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.product')}
          </a>
          <div className="border-t border-gray-200 dark:border-white/10 pt-3">
            <p className="text-xs text-gray-400 mb-2">Language</p>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLang(lang.code);
                    setMobileOpen(false);
                  }}
                  className={`px-3 py-1 text-sm rounded-lg border ${
                    i18n.language === lang.code
                      ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-500/10 dark:border-primary-500/30 dark:text-primary-300'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 pt-3">
            <p className="text-xs text-gray-400 mb-2">Theme</p>
            <div className="flex gap-2">
              {themes.map((th) => (
                <button
                  key={th.value}
                  onClick={() => {
                    setTheme(th.value);
                    setMobileOpen(false);
                  }}
                  className={`px-3 py-1 text-sm rounded-lg border flex items-center gap-1 ${
                    theme === th.value
                      ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-500/10 dark:border-primary-500/30 dark:text-primary-300'
                      : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  <th.icon size={12} />
                  {th.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-white/10 pt-3 flex gap-3">
            <Link
              to="/login"
              className="flex-1 text-center py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-slate-200"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center py-2 text-sm bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
