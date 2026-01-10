import type { LoginCredentials, LoginResponse, Admin } from '@/types/auth.ts';
import { mockApiCall } from '@/mocks';
import { createMockLoginResponse, validateMockCredentials, MOCK_ADMINS } from '@/mocks';

/**
 * Моковые обработчики для аутентификации
 */
export const authMockHandlers = {
  /**
   * Вход в систему
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Валидация
    if (!validateMockCredentials(credentials.email, credentials.password)) {
      throw new Error('Invalid credentials');
    }

    const response = createMockLoginResponse(credentials.email);
    const result = await mockApiCall(response);
    return result.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    await mockApiCall(undefined, 300);
  },

  /**
   * Получить текущего администратора
   */
  async getCurrentAdmin(adminId: string): Promise<Admin> {
    const admin = MOCK_ADMINS.find(a => a.id === adminId);

    if (!admin) {
      throw new Error('Admin not found');
    }

    const result = await mockApiCall(admin);
    return result.data;
  },
};

