import React, { type ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { hasAnyPermission, type Permission } from '../types/permissions';
import { Result, Button } from 'antd';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Требуемые права доступа (хотя бы одно) */
  permissions?: Permission[];
  /** Требуется ли быть аутентифицированным */
  requireAuth?: boolean;
  /** Путь для редиректа при отсутствии доступа */
  redirectTo?: string;
}

/**
 * Компонент для защиты маршрутов
 * Проверяет аутентификацию и права доступа
 */
export function ProtectedRoute({
  children,
  permissions = [],
  requireAuth = true,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated();
  const admin = authService.getStoredAdmin();

  // Если требуется аутентификация, но пользователь не авторизован
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  // Если заданы права доступа, проверяем их
  if (permissions.length > 0 && admin) {
    const hasAccess = hasAnyPermission(admin.role, permissions);

    if (!hasAccess) {
      return (
        <Result
          status="403"
          title="403"
          subTitle="Извините, у вас нет доступа к этой странице."
          extra={
            <Button type="primary" onClick={() => window.location.href = '/'}>
              Вернуться на главную
            </Button>
          }
        />
      );
    }
  }

  return <>{children}</>;
}

/**
 * HOC для защиты компонентов
 */
export function withProtectedRoute(
  Component: React.ComponentType,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

