import apiClient from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import type { LoginCredentials, LoginResponse, Admin } from '../types/auth';
import { isMockEnabled, authMockHandlers } from '@/mocks';

export const authService = {
  // Вход
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    let response: { data: LoginResponse };

    // Используем моки если они включены
    if (isMockEnabled('auth')) {
      const mockData = await authMockHandlers.login(credentials);
      response = { data: mockData };
    } else {
      // Реальный API запрос
      response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
    }

    const { token, admin } = response.data;

    // Сохраняем токен и данные администратора
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(admin));

    return response.data;
  },

  // Выход
  async logout(): Promise<void> {
    try {
      if (isMockEnabled('auth')) {
        await authMockHandlers.logout();
      } else {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } finally {
      // Очищаем локальное хранилище в любом случае
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
    }
  },

  // Получить текущего администратора
  async getCurrentAdmin(): Promise<Admin> {
    if (isMockEnabled('auth')) {
      const storedAdmin = this.getStoredAdmin();
      if (storedAdmin) {
        return authMockHandlers.getCurrentAdmin(storedAdmin.id);
      }
      throw new Error('No admin data in storage');
    } else {
      const response = await apiClient.get<Admin>(API_ENDPOINTS.AUTH.ME);
      return response.data;
    }
  },

  // Проверить, авторизован ли пользователь
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Получить сохраненные данные администратора
  getStoredAdmin(): Admin | null {
    const adminData = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA);
    return adminData ? JSON.parse(adminData) : null;
  },

  // Получить токен
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

