/**
 * Типы для пользователей приложения
 */
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  registeredAt: string;
  lastLoginAt: string;
  isActive: boolean;
  notesCount: number;
}
