import { useEffect } from 'react';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';

export function useThemeSync() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    const el = document.documentElement;
    el.classList.remove('light', 'bright', 'dark');
    el.classList.add(resolved);
    if (resolved === 'bright') el.classList.add('dark');
  }, [theme]);
}
