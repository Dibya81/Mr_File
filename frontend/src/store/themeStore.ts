import { create } from 'zustand';

type Theme = 'light' | 'bright' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const getSystemTheme = (): 'light' | 'bright' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'bright' : 'light';
};

const savedTheme = (localStorage.getItem('dv-theme') as Theme) || 'system';

export const useThemeStore = create<ThemeState>((set) => ({
  theme: savedTheme,
  setTheme: (theme) => {
    localStorage.setItem('dv-theme', theme);
    set({ theme });
  },
}));

export const getResolvedTheme = (theme: Theme): 'light' | 'bright' => {
  if (theme === 'system') return getSystemTheme();
  return theme;
};
