import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import type { Admin } from '../types/auth';

interface UseAuthReturn {
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
}

/**
 * React Hook для работы с аутентификацией
 * Автоматически проверяет авторизацию при монтировании
 */
export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Пытаемся восстановить сессию
      const isAuth = await authService.initializeAuth();

      if (isAuth) {
        // Получаем данные администратора
        const storedAdmin = authService.getStoredAdmin();
        setAdmin(storedAdmin);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    admin,
    isLoading,
    checkAuth,
  };
}
