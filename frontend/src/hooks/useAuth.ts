import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authApi.getMe();
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, [setUser]);

  return { user, isAuthenticated, isLoading, logout };
}
