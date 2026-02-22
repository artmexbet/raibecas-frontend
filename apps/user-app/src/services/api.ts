import axios, { AxiosError, type AxiosResponse } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { tokenManager } from './tokenManager';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRequest =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh');

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      if (tokenManager.getIsRefreshing()) {
        return new Promise((resolve) => {
          tokenManager.addRefreshSubscriber((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      tokenManager.setIsRefreshing(true);

      try {
        const deviceId = localStorage.getItem('device_id') || '';
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { device_id: deviceId },
          { withCredentials: true }
        );

        const { access_token } = response.data as { access_token: string };
        tokenManager.setAccessToken(access_token);
        tokenManager.setIsRefreshing(false);
        tokenManager.notifyRefreshSubscribers(access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenManager.setIsRefreshing(false);
        tokenManager.clearRefreshSubscribers();
        tokenManager.clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

