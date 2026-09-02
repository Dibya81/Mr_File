import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid an infinite reload loop when we're already on a public auth page.
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/signup') {
        // Use replace() so the back button doesn't trap the user on the broken URL.
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
