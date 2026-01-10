import { authService } from '../services/auth.service';
import { hasPermission, hasAnyPermission, hasAllPermissions, type Permission } from '../types/permissions';

/**
 * Хук для работы с системой прав доступа
 * Предоставляет удобный интерфейс для проверки прав текущего администратора
 */
export function usePermissions() {
  const admin = authService.getStoredAdmin();

  /**
   * Проверяет наличие конкретного права у текущего администратора
   */
  const checkPermission = (permission: Permission): boolean => {
    if (!admin) return false;
    return hasPermission(admin.role, permission);
  };

  /**
   * Проверяет наличие хотя бы одного из указанных прав
   */
  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!admin) return false;
    return hasAnyPermission(admin.role, permissions);
  };

  /**
   * Проверяет наличие всех указанных прав
   */
  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!admin) return false;
    return hasAllPermissions(admin.role, permissions);
  };

  return {
    /** Текущий администратор */
    admin,
    /** Проверить одно право */
    checkPermission,
    /** Проверить хотя бы одно право из списка */
    checkAnyPermission,
    /** Проверить все права из списка */
    checkAllPermissions,
  };
}

