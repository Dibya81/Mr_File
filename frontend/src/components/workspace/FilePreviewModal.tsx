import { useEffect, useRef, useState } from 'react';
import { X, Download, ExternalLink, Lock, AlertTriangle, Loader2, Maximize2 } from 'lucide-react';
import api from '@/api/client';
import type { Document } from '@/types';

interface FilePreviewModalProps {
  document: Document;
  onClose: () => void;
}

export default function FilePreviewModal({ document: doc, onClose }: FilePreviewModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(doc.is_locked);
  const [passwordError, setPasswordError] = useState('');

  const loadPreview = async (pwd?: string) => {
    setLoading(true);
    setError(null);
    setPasswordError('');
    try {
      const res = await api.post<{ success: boolean; data: { url: string; filename: string } }>(
        `/documents/${doc.id}/download`,
        pwd ? { password: pwd } : {},
      );
      if (res.data.success && res.data.data.url) {
        setSignedUrl(res.data.data.url);
        setNeedsPassword(false);
      }
    } catch (e: any) {
      const msg = e?.response?.data?.error?.message || '';
      if (e?.response?.status === 403 && /password/i.test(msg)) {
        setNeedsPassword(true);
      } else if (e?.response?.status === 403) {
        setPasswordError('Incorrect password');
      } else {
        setError(`Could not load preview: ${e?.message || 'unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!doc.is_locked) {
      loadPreview();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    loadPreview(password);
  };

  const handleDownload = async () => {
    if (!signedUrl) return;
    try {
      const fileRes = await fetch(signedUrl);
      if (!fileRes.ok) throw new Error(`Download failed (${fileRes.status})`);
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = doc.original_filename;
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e: any) {
      setError(`Download failed: ${e?.message || 'unknown error'}`);
    }
  };

  const handleOpenNewTab = () => {
    if (!signedUrl) return;
    window.open(signedUrl, '_blank', 'noopener,noreferrer');
  };

  const type = (doc.detected_file_type || '').toLowerCase();
  const mime = (doc.detected_mime_type || '').toLowerCase();
  const isPdf = type === 'pdf' || mime === 'application/pdf';
  const isImage =
    type === 'png' || type === 'jpg' || type === 'jpeg' || type === 'gif' || type === 'webp' || type === 'svg' ||
    mime.startsWith('image/');
  const isText = type === 'txt' || type === 'md' || type === 'json' || type === 'csv' || mime.startsWith('text/');
  const isVideo = type === 'mp4' || type === 'webm' || type === 'mov' || type === 'avi' || type === 'mkv' || mime.startsWith('video/');
  const isAudio = type === 'mp3' || type === 'wav' || type === 'ogg' || type === 'm4a' || type === 'flac' || mime.startsWith('audio/');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-[#0f1115] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {doc.original_filename}
            </h2>
            <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
              {doc.detected_file_type}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {signedUrl && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition"
                >
                  <Download size={13} />
                  Download
                </button>
                <button
                  onClick={handleOpenNewTab}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-gray-300"
                  title="Open in new tab"
                >
                  <Maximize2 size={13} />
                  Open
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 relative bg-gray-50 dark:bg-[#0a0c10] flex flex-col">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {needsPassword && !loading && (
            <div className="flex-1 flex items-center justify-center p-6">
              <form
                onSubmit={handleUnlock}
                className="w-full max-w-sm bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4"
              >
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Lock size={18} />
                  <h3 className="font-semibold">Password required</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This file is locked. Enter the password to preview.
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition"
                >
                  Unlock & Preview
                </button>
              </form>
            </div>
          )}

          {error && !loading && !needsPassword && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-3" />
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{error}</p>
              {signedUrl && (
                <button
                  onClick={handleOpenNewTab}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Open in new tab instead →
                </button>
              )}
            </div>
          )}

          {signedUrl && !loading && !needsPassword && !error && (
            <>
              {isPdf && (
                <iframe
                  src={signedUrl}
                  title={doc.original_filename}
                  className="w-full flex-1 min-h-0 border-0 bg-white"
                />
              )}

              {!isPdf && isImage && (
                <div className="flex-1 min-h-0 flex items-center justify-center p-4 overflow-auto">
                  <img
                    src={signedUrl}
                    alt={doc.original_filename}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {!isPdf && !isImage && isVideo && (
                <div className="flex-1 min-h-0 flex items-center justify-center p-4">
                  <video
                    src={signedUrl}
                    controls
                    autoPlay={false}
                    className="max-w-full max-h-full"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              )}

              {!isPdf && !isImage && !isVideo && isAudio && (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 gap-4">
                  <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center">
                    <span className="text-3xl">🎵</span>
                  </div>
                  <audio src={signedUrl} controls className="w-full max-w-md">
                    Your browser does not support audio playback.
                  </audio>
                </div>
              )}

              {!isPdf && !isImage && !isVideo && !isAudio && isText && (
                <iframe
                  src={signedUrl}
                  title={doc.original_filename}
                  className="w-full flex-1 min-h-0 border-0 bg-white"
                />
              )}

              {!isPdf && !isImage && !isVideo && !isAudio && !isText && (
                <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center">
                  <Download className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                    Preview not available for this file type
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Use the Download or Open button to view it.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition"
                    >
                      <Download size={13} />
                      Download
                    </button>
                    <button
                      onClick={handleOpenNewTab}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    >
                      <ExternalLink size={13} />
                      Open in new tab
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
