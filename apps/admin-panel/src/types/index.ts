/**
 * Типы для пользователей приложения
 */
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  registered_at: string;
  last_login_at: string;
  is_active: boolean;
  role?: string;
}
