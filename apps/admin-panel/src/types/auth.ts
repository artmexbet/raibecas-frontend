import { AdminRole } from './permissions';

// Администратор
export interface Admin {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
  createdAt: string;
}

// Данные для логина
export interface LoginCredentials {
  email: string;
  password: string;
  device_id?: string; // Опционально: идентификатор устройства
}

// Ответ от API при логине (новая JWT система)
export interface LoginResponse {
  access_token: string;   // Access token для Authorization header
  refresh_token: string;  // Refresh token (не используется напрямую)
  token_id: string;       // ID токена для операций
  user_id: string;        // ID пользователя
  admin: Admin;           // Данные администратора
  // fingerprint автоматически в HttpOnly cookie
}

// Ответ от API при refresh
export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  token_id: string;
}

// Состояние аутентификации
export interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
}

export interface CreateAdminRequest {
    id: string;
    email: string;
    username: string;
    request: string;
}


