'use client';

import { useState, useCallback } from 'react';
import { Toast } from '@/components/ui/toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = useCallback((toast: Omit<Toast, 'id'>) => {
    return addToast(toast);
  }, [addToast]);

  // Convenience methods
  const success = useCallback((title: string, description?: string) => {
    return toast({ type: 'success', title, description });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    return toast({ type: 'error', title, description });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    return toast({ type: 'info', title, description });
  }, [toast]);

  return {
    toasts,
    toast,
    success,
    error,
    info,
    removeToast,
  };
}