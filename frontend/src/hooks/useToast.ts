import { useCallback, useEffect, useState } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// Module-level state for the toast system
// This allows the toast hook to work across the entire app without needing context
let toastState: Toast[] = [];
let setToastState: ((state: Toast[] | ((prev: Toast[]) => Toast[])) => void) | null = null;

// Generate unique ID
function generateToastId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sync with module-level state
  useEffect(() => {
    toastState = toasts;
    setToastState = setToasts;

    return () => {
      toastState = [];
      setToastState = null;
    };
  }, [toasts]);

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info', duration = 5000) => {
      const id = generateToastId();
      const toast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
}

// Static methods for use outside of React components
export const toast = {
  success: (message: string, duration?: number) => {
    if (setToastState) {
      const id = generateToastId();
      const newToast: Toast = { id, message, type: 'success', duration };
      setToastState((prev) => [...prev, newToast]);

      if (duration !== 0) {
        setTimeout(() => {
          setToastState?.((prev) => prev.filter((t) => t.id !== id));
        }, duration || 5000);
      }

      return id;
    }
    console.warn('Toast system not initialized. Use useToast hook inside a component.');
    return null;
  },

  error: (message: string, duration?: number) => {
    if (setToastState) {
      const id = generateToastId();
      const newToast: Toast = { id, message, type: 'error', duration };
      setToastState((prev) => [...prev, newToast]);

      if (duration !== 0) {
        setTimeout(() => {
          setToastState?.((prev) => prev.filter((t) => t.id !== id));
        }, duration || 5000);
      }

      return id;
    }
    console.warn('Toast system not initialized. Use useToast hook inside a component.');
    return null;
  },

  info: (message: string, duration?: number) => {
    if (setToastState) {
      const id = generateToastId();
      const newToast: Toast = { id, message, type: 'info', duration };
      setToastState((prev) => [...prev, newToast]);

      if (duration !== 0) {
        setTimeout(() => {
          setToastState?.((prev) => prev.filter((t) => t.id !== id));
        }, duration || 5000);
      }

      return id;
    }
    console.warn('Toast system not initialized. Use useToast hook inside a component.');
    return null;
  },
};
