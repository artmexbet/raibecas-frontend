import { AdminRole } from '@/types/permissions';
import type { Admin, LoginResponse } from '@/types/auth';

/**
 * Моковые данные администраторов
 */
export const MOCK_ADMINS: Admin[] = [
  {
    id: '1',
    username: 'Super Admin',
    email: 'superadmin@example.com',
    role: AdminRole.SUPER_ADMIN,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    username: 'Admin User',
    email: 'admin@example.com',
    role: AdminRole.ADMIN,
    createdAt: '2024-06-15T10:30:00.000Z',
  },
  {
    id: '3',
    username: 'John Admin',
    email: 'john@example.com',
    role: AdminRole.ADMIN,
    createdAt: '2024-09-20T14:15:00.000Z',
  },
];

/**
 * Создает моковый ответ для логина
 */
export function createMockLoginResponse(email: string): LoginResponse {
  // Ищем существующего админа по email
  let admin = MOCK_ADMINS.find(a => a.email === email);

  // Если не найден, создаем нового с ролью SUPER_ADMIN
  if (!admin) {
    admin = {
      id: String(MOCK_ADMINS.length + 1),
      username: email.split('@')[0] || 'new_admin',
      email: email,
      role: AdminRole.SUPER_ADMIN,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    token: `mock-jwt-token-${admin.id}-${Date.now()}`,
    admin,
  };
}

/**
 * Валидация моковых учетных данных
 * В моке принимаем любой пароль длиной >= 6 символов
 */
export function validateMockCredentials(email: string, password: string): boolean {
  return email.includes('@') && password.length >= 6;
}

