import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import {
  ChevronRight,
  Search,
  Sun,
  Moon,
  Monitor,
  Globe,
  ChevronDown,
  X,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { documentsApi } from '@/api/documents';
import { cn } from '@/utils/helpers';

interface BreadcrumbItem {
  label: string;
  href?: string | undefined;
}

interface WorkspaceHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
  onSelectFile?: (docId: string) => void;
}

export default function WorkspaceHeader({ title, subtitle, breadcrumb = [], actions, onSelectFile }: WorkspaceHeaderProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: searchResults } = useQuery({
    queryKey: ['workspace-search', searchQuery],
    queryFn: () => documentsApi.list({ search: searchQuery, per_page: 5, folder_id: '' }),
    enabled: searchQuery.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 10000,
  });

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('dv-lang', lng);
    setLangOpen(false);
  }, [i18n]);

  const handleSearchSelect = (docId: string) => {
    setShowSearch(false);
    setSearchInput('');
    setSearchQuery('');
    if (onSelectFile) {
      onSelectFile(docId);
    } else {
      navigate(`/dashboard?doc=${docId}`);
    }
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearchQuery('');
    setShowSearch(false);
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

  const borderColor = isDark ? 'border-white/[0.06]' : 'border-black/[0.06]';
  const sectionLabelColor = isDark ? 'text-slate-500' : 'text-gray-400';
  const iconColor = isDark ? 'text-slate-400' : 'text-gray-400';
  const activeIconColor = isDark ? 'text-white' : 'text-gray-900';
  const inputBg = isDark ? 'bg-white/[0.04]' : 'bg-gray-50';
  const inputBorder = isDark ? 'border-white/[0.08]' : 'border-gray-200';
  const inputText = isDark ? 'text-white' : 'text-gray-900';
  const inputPlaceholder = isDark ? 'placeholder-slate-500' : 'placeholder-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50';

  const ThemeIcon = themes.find((th) => th.value === theme)?.icon ?? Monitor;

  return (
    <header
      className={cn(
        'sticky top-0 z-20 border-b shrink-0',
        borderColor,
        isDark ? 'bg-[#090D16]/80' : 'bg-white/80',
        'backdrop-blur-xl'
      )}
    >
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
        <div className="flex-1 min-w-0">
          {breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1 mb-0.5">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={12} className={sectionLabelColor} />}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className={cn(
                        'text-xs hover:underline transition-colors',
                        sectionLabelColor, 'hover:', activeIconColor
                      )}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={cn('text-xs', sectionLabelColor)}>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <div className="flex items-baseline gap-2">
            <h1 className={cn('text-base font-semibold truncate', isDark ? 'text-white' : 'text-gray-900')}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn('text-sm truncate hidden sm:block', sectionLabelColor)}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {actions && (
            <div className="flex items-center gap-2 mr-2">
              {actions}
            </div>
          )}

          <div ref={searchRef} className="relative">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={cn(
                'p-2 rounded-lg transition-colors',
                hoverBg,
                showSearch ? activeIconColor : iconColor
              )}
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-xl overflow-hidden z-50',
                    isDark ? 'bg-[#0B0F19] border-white/[0.08]' : 'bg-white border-black/[0.06]'
                  )}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
                    <Search size={14} className={iconColor} />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={t('workspace.search.placeholder')}
                      className={cn(
                        'flex-1 bg-transparent text-sm focus:outline-none',
                        inputText, inputPlaceholder
                      )}
                      autoFocus
                    />
                    {searchInput && (
                      <button onClick={handleSearchClear} className={iconColor}>
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1">
                    {(() => {
                      if (!searchQuery) {
                        return (
                          <p className={cn('px-3 py-4 text-center text-sm', sectionLabelColor)}>
                            {t('workspace.search.hint')}
                          </p>
                        );
                      }
                      const docs = ((searchResults?.data as any)?.documents ?? (searchResults?.data as any)?.items ?? []) as any[];
                      if (docs.length === 0) {
                        return (
                          <p className={cn('px-3 py-4 text-center text-sm', sectionLabelColor)}>
                            {t('workspace.search.noResults')}
                          </p>
                        );
                      }
                      return docs.map((doc: any) => (
                        <button
                          key={doc.id}
                          onClick={() => handleSearchSelect(doc.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                            hoverBg
                          )}
                        >
                          <FileText size={14} className={iconColor} />
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm truncate', isDark ? 'text-white' : 'text-gray-900')}>
                              {doc.original_filename}
                            </p>
                            <p className={cn('text-xs truncate capitalize', sectionLabelColor)}>
                              {doc.detected_file_type} &middot; {doc.processing_status}
                            </p>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              onClick={() => { setThemeOpen(!themeOpen); setLangOpen(false); }}
              className={cn('p-2 rounded-lg transition-colors', hoverBg, activeIconColor)}
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
                    isDark ? 'bg-[#0B0F19] border-white/[0.08]' : 'bg-white border-black/[0.06]'
                  )}
                >
                  {themes.map((th) => (
                    <button
                      key={th.value}
                      onClick={() => { setTheme(th.value); setThemeOpen(false); }}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors',
                        hoverBg,
                        theme === th.value
                          ? isDark ? 'text-blue-400 font-medium' : 'text-primary-600 font-medium'
                          : isDark ? 'text-slate-300' : 'text-gray-700'
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
              className={cn(
                'flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium transition-colors',
                hoverBg, activeIconColor
              )}
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
                  className={cn(
                    'absolute right-0 top-full mt-2 w-36 rounded-xl border shadow-xl py-1 z-50',
                    isDark ? 'bg-[#0B0F19] border-white/[0.08]' : 'bg-white border-black/[0.06]'
                  )}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={cn(
                        'w-full text-left px-3 py-2 text-sm transition-colors',
                        hoverBg,
                        i18n.language === lang.code
                          ? isDark ? 'text-blue-400 font-medium' : 'text-primary-600 font-medium'
                          : isDark ? 'text-slate-300' : 'text-gray-700'
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
