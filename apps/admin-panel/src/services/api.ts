import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/api';
import { tokenManager } from './tokenManager';

// Создаем экземпляр axios с поддержкой credentials для cookies (fingerprint)
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ВАЖНО: для отправки HttpOnly cookies (fingerprint)
});

/**
 * Request Interceptor - добавляем access token к каждому запросу
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();

    // Добавляем access token в Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - автоматическое обновление токенов при 401
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Если получили 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {

      // Не пытаемся refresh для запросов логина или самого refresh
      const isAuthRequest = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/refresh');

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      // Если уже идёт процесс обновления токена
      if (tokenManager.getIsRefreshing()) {
        // Добавляем запрос в очередь и ждём новый токен
        return new Promise((resolve) => {
          tokenManager.addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Помечаем запрос как повторный
      originalRequest._retry = true;
      tokenManager.setIsRefreshing(true);

      try {
        // Получаем device_id
        const deviceId = localStorage.getItem('device_id') || '';

        // Пытаемся обновить токен
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { device_id: deviceId },
          {
            withCredentials: true, // Отправляем fingerprint cookie
          }
        );

        const { access_token } = response.data;

        // Сохраняем новый access token
        tokenManager.setAccessToken(access_token);
        tokenManager.setIsRefreshing(false);

        // Уведомляем все отложенные запросы о новом токене
        tokenManager.notifyRefreshSubscribers(access_token);

        // Повторяем оригинальный запрос с новым токеном
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh не удался - разлогиниваем пользователя
        tokenManager.setIsRefreshing(false);
        tokenManager.clearRefreshSubscribers();
        tokenManager.clearAccessToken();

        // Редирект на страницу логина
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // Для других ошибок просто пробрасываем
    return Promise.reject(error);
  }
);

export default apiClient;
