import { AdminRole } from './permissions';

// Администратор
export interface Admin {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
  created_at: string;
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
  expires_in: number;     // Время жизни access token в секундах
  token_type: string;     // Тип токена (обычно "Bearer")
  user: Admin;
}

// Ответ от API при refresh (аналогичен LoginResponse)
export interface RefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  user: Admin;
}

export interface CreateAdminRequest {
    id: string;
    email: string;
    username: string;
    status: 'pending' | 'approved' | 'rejected';
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    approvedBy?: string;
    approvedAt?: string;
}


