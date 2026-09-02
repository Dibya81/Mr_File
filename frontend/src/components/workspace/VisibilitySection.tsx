import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { documentsApi } from '@/api/documents';
import { toast } from '@/hooks/useToast';
import type { Document, Visibility } from '@/types';
import { cn } from '@/utils/helpers';

interface Props {
  document: Document;
}

const VISIBILITY_OPTIONS: { value: Visibility; icon: React.ElementType; description: string }[] = [
  { value: 'private', icon: Lock, description: 'Only you can access this file.' },
  { value: 'password', icon: ShieldCheck, description: 'Anyone with the password can access.' },
  { value: 'public', icon: Globe, description: 'Anyone with the link can download this file.' },
];

export default function VisibilitySection({ document: doc }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [visibility, setVisibility] = useState<Visibility>((doc.visibility as Visibility) || 'private');
  const [publicTitle, setPublicTitle] = useState(doc.public_title || '');
  const [publicPassword, setPublicPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setVisibility((doc.visibility as Visibility) || 'private');
    setPublicTitle(doc.public_title || '');
  }, [doc.id, doc.visibility, doc.public_title]);

  const mutation = useMutation({
    mutationFn: async (data: { visibility: Visibility; public_password?: string; public_title?: string | null }) => {
      return documentsApi.update(doc.id, data);
    },
    onSuccess: () => {
      toast.success('Visibility updated');
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['document', doc.id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message || 'Failed to update visibility');
    },
  });

  const handleApply = (next: Visibility) => {
    if (next === visibility) return;
    if (next === 'password' && !publicPassword && !doc.has_public_password) {
      toast.error('Set a password first');
      return;
    }
    const payload: any = { visibility: next, public_title: publicTitle || null };
    if (next === 'password' && publicPassword) {
      payload.public_password = publicPassword;
      setPublicPassword('');
    }
    if (next === 'private' || next === 'public') {
      payload.public_password = null;
    }
    mutation.mutate(payload);
    setVisibility(next);
  };

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        {t('visibility.title')}
      </h3>
      <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-3 space-y-2">
        {VISIBILITY_OPTIONS.map(({ value, icon: Icon, description }) => {
          const active = visibility === value;
          return (
            <button
              key={value}
              onClick={() => handleApply(value)}
              disabled={mutation.isPending}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left transition border',
                active
                  ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-500/10'
                  : 'border-transparent hover:bg-gray-100 dark:hover:bg-white/5',
              )}
            >
              <Icon
                size={16}
                className={cn(
                  'mt-0.5 shrink-0',
                  active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400',
                )}
              />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', active ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white')}>
                  {t(`visibility.${value}`)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
              </div>
              {active && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Active
                </span>
              )}
            </button>
          );
        })}

        {(visibility === 'public' || visibility === 'password') && (
          <div className="space-y-2 pt-1">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t('visibility.publicTitle')}</label>
              <input
                type="text"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                onBlur={() => {
                  if (publicTitle !== (doc.public_title || '')) {
                    mutation.mutate({ visibility, public_title: publicTitle || null });
                  }
                }}
                placeholder={t('visibility.publicTitlePlaceholder')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
            {visibility === 'password' && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  {doc.has_public_password ? 'Change Password' : t('visibility.setPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={publicPassword}
                    onChange={(e) => setPublicPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && publicPassword.length >= 6) {
                        mutation.mutate({ visibility, public_password: publicPassword, public_title: publicTitle || null });
                        setPublicPassword('');
                      }
                    }}
                    placeholder={t('visibility.passwordPlaceholder')}
                    className="w-full px-3 py-2 pr-9 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {publicPassword.length > 0 && publicPassword.length < 6 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">At least 6 characters</p>
                )}
                <button
                  onClick={() => {
                    if (publicPassword.length >= 6) {
                      mutation.mutate({ visibility, public_password: publicPassword, public_title: publicTitle || null });
                      setPublicPassword('');
                    }
                  }}
                  disabled={publicPassword.length < 6 || mutation.isPending}
                  className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50"
                >
                  Update password
                </button>
              </div>
            )}
            {doc.visibility === 'public' && doc.public_title && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Public link: <span className="font-mono text-gray-700 dark:text-gray-300">/public/documents/{doc.id}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
