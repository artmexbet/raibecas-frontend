import apiClient from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants/api';
import type { LoginCredentials, LoginResponse, Admin } from '../types/auth';
import {AdminRole} from "@/types/permissions.ts";

export const authService = {
  // Вход
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // const response = await apiClient.post<LoginResponse>(
    //   API_ENDPOINTS.AUTH.LOGIN,
    //   credentials
    // ); //todo: remove comments and use real api

    // Заглушка для демонстрации
    const response = await new Promise<{ data: LoginResponse }>((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              token: 'mocked-jwt-token',
              admin: {
                id: '1',
                username: 'Admin User',
                email: credentials.email,
                role: AdminRole.SUPER_ADMIN,
                createdAt: new Date().toISOString(),
              },
            },
          }),
        1000
      )
    );

    const { token, admin } = response.data;

    // Сохраняем токен и данные администратора
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(admin));

    return response.data;
  },

  // Выход
  async logout(): Promise<void> {
    try {
      // await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);//todo: uncomment when real api will be used
    } finally {
      // Очищаем локальное хранилище в любом случае
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
    }
  },

  // Получить текущего администратора
  async getCurrentAdmin(): Promise<Admin> {
    const response = await apiClient.get<Admin>(API_ENDPOINTS.AUTH.ME);
    return response.data;
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

