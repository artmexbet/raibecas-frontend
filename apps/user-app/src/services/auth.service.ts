import apiClient from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/constants/api';
import { tokenManager } from './tokenManager';
import type { LoginCredentials, LoginResponse, RegisterRequest, RegisterResponse, User } from '@/types/auth';

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      ...credentials,
      device_id: getDeviceId(),
    }, { withCredentials: true });

    const { access_token, user } = response.data;
    tokenManager.setAccessToken(access_token);

    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }

    return response.data;
  },

  /**
   * TODO: реализовать эндпоинт на бэкенде POST /auth/register
   * Регистрация нового пользователя (статус "pending" до одобрения)
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      const accessToken = tokenManager.getAccessToken();
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, { token: accessToken }, { withCredentials: true });
    } finally {
      this.clearAuthData();
    }
  },

  isAuthenticated(): boolean {
    return tokenManager.getAccessToken() !== null;
  },

  getStoredUser(): User | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? (JSON.parse(data) as User) : null;
  },

  clearAuthData(): void {
    tokenManager.clearAccessToken();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};

