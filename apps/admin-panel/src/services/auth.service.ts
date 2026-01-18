import apiClient from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import type { LoginCredentials, LoginResponse, Admin } from '../types/auth';
import { isMockEnabled, authMockHandlers } from '@/mocks';
import { tokenManager } from './tokenManager';

/**
 * Генерирует уникальный ID устройства
 */
function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export const authService = {
  /**
   * Вход в систему с новой JWT архитектурой
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    let response: { data: LoginResponse };

    // Добавляем device_id к credentials
    const loginData = {
      ...credentials,
      device_id: getDeviceId(),
    };

    // Используем моки если они включены
    if (isMockEnabled('auth')) {
      const mockData = await authMockHandlers.login(credentials);
      // Адаптируем mock данные к новому формату
      response = {
        data: {
          access_token: mockData.access_token,
          refresh_token: 'mock_refresh_token',
          token_id: 'mock_token_id',
          user_id: mockData.admin.id,
          admin: mockData.admin,
        },
      };
    } else {
      // Реальный API запрос с credentials для fingerprint cookie
      response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData,
        {
          withCredentials: true, // ВАЖНО: для получения fingerprint cookie
        }
      );
    }

    const { access_token, token_id, admin } = response.data;

    // Сохраняем access token в память (НЕ в localStorage!)
    tokenManager.setAccessToken(access_token);

    // Сохраняем token_id для logout и данные администратора
    localStorage.setItem(STORAGE_KEYS.TOKEN_ID, token_id);
    localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(admin));

    return response.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      const tokenId = localStorage.getItem(STORAGE_KEYS.TOKEN_ID);

      if (isMockEnabled('auth')) {
        await authMockHandlers.logout();
      } else {
        // Отправляем token_id для отзыва refresh токена
        await apiClient.post(
          API_ENDPOINTS.AUTH.LOGOUT,
          { token_id: tokenId },
          {
            withCredentials: true, // Удаляем fingerprint cookie
          }
        );
      }
    } finally {
      // Очищаем всё локальное хранилище и память
      tokenManager.clearAccessToken();
      localStorage.removeItem(STORAGE_KEYS.TOKEN_ID);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
    }
  },

  /**
   * Получить текущего администратора
   */
  async getCurrentAdmin(): Promise<Admin> {
    if (isMockEnabled('auth')) {
      const storedAdmin = this.getStoredAdmin();
      if (storedAdmin) {
        return authMockHandlers.getCurrentAdmin(storedAdmin.id);
      }
      throw new Error('No admin data in storage');
    } else {
      const response = await apiClient.get<Admin>(
        API_ENDPOINTS.AUTH.ME,
        {
          withCredentials: true,
        }
      );
      return response.data;
    }
  },

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    // Проверяем наличие access token в памяти
    return tokenManager.getAccessToken() !== null;
  },

  /**
   * Получить сохраненные данные администратора
   */
  getStoredAdmin(): Admin | null {
    const adminData = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA);
    return adminData ? JSON.parse(adminData) : null;
  },

  /**
   * Получить access token из памяти
   */
  getAccessToken(): string | null {
    return tokenManager.getAccessToken();
  },

  /**
   * Попытаться восстановить сессию при загрузке приложения
   * Вызывается при инициализации приложения
   */
  async initializeAuth(): Promise<boolean> {
    try {
      // Если есть сохранённые данные админа, пытаемся получить новый access token
      const storedAdmin = this.getStoredAdmin();
      if (!storedAdmin) {
        return false;
      }

      // Пытаемся обновить токен через refresh
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.REFRESH,
        {},
        {
          withCredentials: true, // Отправляем fingerprint cookie
        }
      );

      const { access_token, token_id } = response.data;

      // Сохраняем новый access token в память
      tokenManager.setAccessToken(access_token);
      localStorage.setItem(STORAGE_KEYS.TOKEN_ID, token_id);

      return true;
    } catch (error) {
      // Если refresh не удался, очищаем данные
      this.clearAuthData();
      return false;
    }
  },

  /**
   * Очистить все данные авторизации
   */
  clearAuthData(): void {
    tokenManager.clearAccessToken();
    localStorage.removeItem(STORAGE_KEYS.TOKEN_ID);
    localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
  },
};



