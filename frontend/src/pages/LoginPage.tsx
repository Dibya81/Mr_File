import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Shield } from 'lucide-react';
import AuthHeaderControls from '../components/auth/AuthHeaderControls';

type LoginMode = 'user' | 'admin';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [mode, setMode] = useState<LoginMode>('user');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      if (res.success && res.data) {
        const user = res.data;
        if (mode === 'admin' && user.role !== 'admin') {
          setError('This account is not an admin. Use the user login.');
          return;
        }
        setUser(user);
        if (mode === 'admin') {
          navigate('/admin');
        } else {
          if (user.role === 'admin') navigate('/admin');
          else navigate('/dashboard');
        }
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ identifier, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#090D16] px-4">
      <div className="absolute top-4 right-4">
        <AuthHeaderControls variant="light" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-600">DocumentVault</Link>
          <h1 className="text-2xl font-bold mt-4">
            {mode === 'admin' ? 'Admin Sign In' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === 'admin'
              ? 'Sign in to the admin control center'
              : 'Sign in to your account'}
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => { setMode('user'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
              mode === 'user'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => { setMode('admin'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition flex items-center justify-center gap-1.5 ${
              mode === 'admin'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield size={14} />
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className={`w-full py-2.5 text-white rounded-lg disabled:opacity-50 transition font-medium ${
              mode === 'admin'
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {loginMutation.isPending
              ? 'Signing in...'
              : mode === 'admin'
                ? 'Sign In as Admin'
                : 'Sign In'}
          </button>

          {mode === 'user' && (
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:underline">Sign up</Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
