/**
 * Типы для системы прав доступа
 */

export enum AdminRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export type Permission = 
  | 'view_documents'
  | 'create_documents'
  | 'edit_documents'
  | 'delete_documents'
  | 'view_users'
  | 'manage_users'
  | 'view_registration_requests'
  | 'manage_registration_requests'
  | 'view_statistics'
  | 'manage_settings';

/**
 * Карта прав доступа для ролей
 */
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.ADMIN]: [
    'view_documents',
    'create_documents',
    'edit_documents',
    'delete_documents',
    'view_users',
    'view_registration_requests',
    'manage_registration_requests',
    'view_statistics',
  ],
  [AdminRole.SUPER_ADMIN]: [
    'view_documents',
    'create_documents',
    'edit_documents',
    'delete_documents',
    'view_users',
    'manage_users',
    'view_registration_requests',
    'manage_registration_requests',
    'view_statistics',
    'manage_settings',
  ],
};

/**
 * Проверка наличия права у роли
 */
export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Проверка наличия хотя бы одного из прав
 */
export function hasAnyPermission(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Проверка наличия всех указанных прав
 */
export function hasAllPermissions(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

