import { Globe, Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Visibility } from '@/types';
import { cn } from '@/utils/helpers';

interface Props {
  visibility?: Visibility | string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function VisibilityBadge({ visibility = 'private', className, size = 'sm' }: Props) {
  const { t } = useTranslation();

  if (visibility === 'public') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          className,
        )}
        title={t('visibility.public')}
      >
        <Globe size={size === 'sm' ? 9 : 11} />
        {t('visibility.public')}
      </span>
    );
  }

  if (visibility === 'password') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-medium',
          size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
          'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          className,
        )}
        title={t('visibility.password')}
      >
        <ShieldCheck size={size === 'sm' ? 9 : 11} />
        {t('visibility.password')}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
        'bg-slate-500/10 text-slate-400 border border-slate-500/20',
        className,
      )}
      title={t('visibility.private')}
    >
      <Lock size={size === 'sm' ? 9 : 11} />
      {t('visibility.private')}
    </span>
  );
}
