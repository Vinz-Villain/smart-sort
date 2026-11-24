import { useState, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'smartsort_operator_auth';

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  const verifyPin = useCallback((inputPin) => {
    const validPin = import.meta.env.VITE_ADMIN_PIN || '654321';
    if (String(inputPin).trim() === String(validPin).trim()) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, verifyPin, logout };
}
