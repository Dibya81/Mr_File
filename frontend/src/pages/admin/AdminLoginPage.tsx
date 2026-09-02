import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const existingUser = useAuthStore((s) => s.user);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingUser?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [existingUser, navigate]);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      if (res.success && res.data) {
        if (res.data.role !== 'admin') {
          setError('This account does not have admin privileges.');
          return;
        }
        setUser(res.data);
        navigate('/admin', { replace: true });
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Please enter both email/username and password');
      return;
    }
    loginMutation.mutate({ identifier: identifier.trim(), password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-deep text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-indigo-600/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft size={13} />
          Back to site
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-400">
          <Lock size={11} />
          Restricted area
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
              <Shield size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">DocumentVault Admin</h1>
            <p className="text-sm text-slate-400 mt-1.5">
              Sign in to the control center.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl space-y-4"
          >
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email or username
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                placeholder="admin@documentvault.app"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-white/10 bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
            >
              {loginMutation.isPending ? 'Authenticating…' : 'Sign in to admin'}
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-1">
              Admin access is granted only to accounts with the <code className="text-slate-300">admin</code> role.
            </p>
          </form>

          <p className="text-center text-[11px] text-slate-500 mt-6">
            Not an admin?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              Go to user login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
