import apiClient from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import type { LoginCredentials, LoginResponse, Admin, RefreshResponse } from '../types/auth';
import type { AdminRole } from '../types/permissions';
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
          expires_in: 900, // 15 минут
          token_type: 'Bearer',
          user: mockData.user,
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

    const { access_token, user } = response.data;

    // Сохраняем access token в память (НЕ в localStorage!)
    tokenManager.setAccessToken(access_token);

    // Сохраняем данные администратора, если они есть
    if (user) {
      // Преобразуем в формат Admin для совместимости
      const email = user.email || credentials.email;
      const adminData: Admin = {
        id: user.id,
        email: email,
        username: email.split('@')[0] || 'Unknown',
        role: user.role as AdminRole,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(adminData));
    }

    return response.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    try {
      const accessToken = tokenManager.getAccessToken();

      if (isMockEnabled('auth')) {
        await authMockHandlers.logout();
      } else {
        // Отправляем access token для выхода
        await apiClient.post(
          API_ENDPOINTS.AUTH.LOGOUT,
          { token: accessToken },
          {
            withCredentials: true, // Удаляем fingerprint cookie
          }
        );
      }
    } finally {
      // Очищаем всё локальное хранилище и память
      this.clearAuthData();
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
      const response = await apiClient.post<RefreshResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { device_id: getDeviceId() },
        {
          withCredentials: true, // Отправляем fingerprint cookie
        }
      );

      const { access_token, user } = response.data;

      // Сохраняем новый access token в память
      tokenManager.setAccessToken(access_token);

      // Обновляем данные пользователя, если пришли
      if (user) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(user));
      }

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
    localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
  },
};



