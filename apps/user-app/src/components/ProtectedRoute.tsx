import React from 'react';
import { Navigate } from '@tanstack/react-router';
import { authService } from '@/services/auth.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Защищает маршрут — редиректит на /login если не авторизован
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

