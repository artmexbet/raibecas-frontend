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
  remember?: boolean;
}

// Ответ от API при логине
export interface LoginResponse {
  token: string;
  admin: Admin;
}

// Состояние аутентификации
export interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
}

export interface CreateAdminRequest {
    id: string;
    email: string;
    username: string;
    request: string;
}
