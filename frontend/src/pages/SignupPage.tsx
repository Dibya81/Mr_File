import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import AuthHeaderControls from '../components/auth/AuthHeaderControls';

export default function SignupPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { data: usernameCheck } = useQuery({
    queryKey: ['username-check', form.username],
    queryFn: () => authApi.checkUsername(form.username),
    enabled: form.username.length >= 3,
    staleTime: 5000,
  });

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (res) => {
      if (res.success && res.data) {
        setUser(res.data);
        navigate('/dashboard');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || err.response?.data?.detail || 'Signup failed');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.username.toLowerCase() === form.name.toLowerCase()) {
      setError('Username cannot be the same as your name');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    signupMutation.mutate(form);
  };

  const usernameAvailable = usernameCheck?.data?.available;
  const usernameSameAsName = form.username.toLowerCase() === form.name.toLowerCase() && form.username.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#090D16] px-4">
      <div className="absolute top-4 right-4">
        <AuthHeaderControls variant="light" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-600">DocumentVault</Link>
          <h1 className="text-2xl font-bold mt-4">Create Account</h1>
          <p className="text-gray-600 mt-1">Start managing documents securely</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <input type="text" name="username" value={form.username} onChange={handleChange}
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required />
              {form.username.length >= 3 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameSameAsName ? <X size={18} className="text-red-500" /> :
                   usernameAvailable ? <Check size={18} className="text-green-500" /> :
                   <X size={18} className="text-red-500" />}
                </span>
              )}
            </div>
            {usernameSameAsName && <p className="text-xs text-red-600 mt-1">Username cannot be the same as your name</p>}
            {form.username.length >= 3 && !usernameAvailable && !usernameSameAsName && (
              <p className="text-xs text-red-600 mt-1">Username already taken</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" required minLength={8} />
          </div>

          <button type="submit" disabled={signupMutation.isPending}
            className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition font-medium">
            {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
