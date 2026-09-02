import { ReactNode } from 'react';
import { useThemeStore, getResolvedTheme } from '@/store/themeStore';
import { cn } from '@/utils/helpers';

interface Props {
  children: ReactNode;
}

export default function CommunityLayout({ children }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = getResolvedTheme(theme);
  const isDark = resolvedTheme === 'bright';

  return (
    <div className="flex flex-col min-h-full">
      <div className="px-4 sm:px-6 py-5 border-b border-slate-800/80 light:border-gray-200">
        <h1 className={cn('text-xl font-semibold tracking-tight', isDark ? 'text-white' : 'text-gray-900')}>
          Community
        </h1>
        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-gray-500')}>
          Request documents, offer your own, and receive copies in your workspace.
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
