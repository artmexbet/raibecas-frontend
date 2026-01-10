import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { hasPermission, hasAnyPermission, type Permission } from '../types/permissions';

interface PermissionGuardProps {
  /** Компонент, который нужно показать при наличии прав */
  children: ReactNode;
  /** Список требуемых прав */
  permissions: Permission[];
  /** Требуются ли все права (true) или хотя бы одно (false) */
  requireAll?: boolean;
  /** Компонент для отображения при отсутствии прав */
  fallback?: ReactNode;
}

/**
 * Компонент для условного рендеринга на основе прав доступа
 *
 * @example
 * // Показать только с правом редактирования
 * <PermissionGuard permissions={['edit_documents']}>
 *   <EditButton />
 * </PermissionGuard>
 *
 * @example
 * // Показать только с обоими правами
 * <PermissionGuard
 *   permissions={['edit_documents', 'delete_documents']}
 *   requireAll
 * >
 *   <AdvancedEditor />
 * </PermissionGuard>
 *
 * @example
 * // С fallback при отсутствии прав
 * <PermissionGuard
 *   permissions={['manage_users']}
 *   fallback={<div>Недостаточно прав</div>}
 * >
 *   <UserManager />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const admin = authService.getStoredAdmin();

  if (!admin) {
    return <>{fallback}</>;
  }

  const hasAccess = requireAll
    ? permissions.every(p => hasPermission(admin.role, p))
    : hasAnyPermission(admin.role, permissions);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

