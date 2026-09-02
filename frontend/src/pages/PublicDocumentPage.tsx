import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Save, Lock, Globe, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/api/client';
import { communityApi } from '@/api/community';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import { cn, formatFileSize, formatDate } from '@/utils/helpers';

interface PublicDocMeta {
  id: string;
  original_filename: string;
  public_title: string | null;
  file_size: number;
  detected_file_type: string;
  has_public_password: boolean;
  created_at: string;
}

export default function PublicDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-doc', id],
    queryFn: async () => {
      const res = await api.get(`/documents/public/${id}`);
      return res.data.data as PublicDocMeta;
    },
    enabled: !!id,
  });

  const downloadMutation = useMutation({
    mutationFn: async (pwd?: string) => {
      const res = await api.post(
        `/documents/public/${id}`,
        pwd ? { password: pwd } : {},
        { responseType: 'blob' },
      );
      return res.data as Blob;
    },
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data?.original_filename || 'document';
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
    },
    onError: (err: any) => {
      setDownloading(false);
      toast.error(err?.response?.data?.error?.message || 'Download failed');
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => communityApi.saveToWorkspace(id!),
    onSuccess: () => {
      toast.success('Saved to your Community Received folder');
      setSaving(false);
      if (isAuthenticated) navigate('/dashboard');
    },
    onError: (err: any) => {
      setSaving(false);
      toast.error(err?.response?.data?.error?.message || 'Could not save');
    },
  });

  const handleDownload = () => {
    setDownloading(true);
    downloadMutation.mutate(data?.has_public_password ? password : undefined);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/public/documents/${id}` } });
      return;
    }
    setSaving(true);
    saveMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deep text-white">
        <div className="text-center">
          <Globe size={48} className="mx-auto text-slate-500 mb-4" />
          <h1 className="text-xl font-semibold mb-2">Document not found</h1>
          <p className="text-sm text-slate-400">This file is not available or has been removed.</p>
          <Link to="/" className="mt-4 inline-block text-primary-400 hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-6">
          <ArrowLeft size={14} />
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 shadow-2xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Globe size={24} className="text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {data.public_title || data.original_filename}
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {data.detected_file_type.toUpperCase()} · {formatFileSize(data.file_size)} · {formatDate(data.created_at)}
              </p>
              {data.has_public_password && (
                <p className="text-xs text-amber-400 mt-2 inline-flex items-center gap-1">
                  <Lock size={11} /> Password protected
                </p>
              )}
            </div>
          </div>

          {data.has_public_password && (
            <div className="mt-5">
              <label className="text-xs text-slate-400 mb-1.5 block">
                {t('public.passwordRequired')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('public.enterPassword')}
                  className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading || (data.has_public_password && !password)}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg',
                'bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50',
              )}
            >
              <Download size={15} />
              {downloading ? 'Downloading…' : t('public.download')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving…' : t('public.saveToWorkspace')}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-slate-500 mt-6">
          Shared via DocumentVault
        </p>
      </div>
    </div>
  );
}
