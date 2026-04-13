'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string): boolean => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin123321.com';
    if (email.trim() === adminEmail || email.trim() === 'admin123321.com') {
      localStorage.setItem('admin_session', 'true');
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_session');
    setIsAdmin(false);
  }, []);

  return { isAdmin, isLoading, login, logout };
}
