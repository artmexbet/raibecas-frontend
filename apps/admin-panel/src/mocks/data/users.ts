/**
 * Типы для пользователей
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

/**
 * Моковые данные пользователей
 */
export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'ivan.petrov@example.com',
    username: 'ivan_petrov',
    fullName: 'Иван Петров',
    registeredAt: '2024-01-10T08:30:00.000Z',
    lastLoginAt: '2026-01-09T15:20:00.000Z',
    isActive: true,
    notesCount: 23,
  },
  {
    id: '2',
    email: 'maria.smirnova@example.com',
    username: 'maria_s',
    fullName: 'Мария Смирнова',
    registeredAt: '2024-02-15T10:00:00.000Z',
    lastLoginAt: '2026-01-08T11:45:00.000Z',
    isActive: true,
    notesCount: 15,
  },
  {
    id: '3',
    email: 'alex.ivanov@example.com',
    username: 'alex_iv',
    fullName: 'Александр Иванов',
    registeredAt: '2024-03-20T14:15:00.000Z',
    lastLoginAt: '2025-12-25T09:10:00.000Z',
    isActive: false,
    notesCount: 8,
  },
  {
    id: '4',
    email: 'elena.volkova@example.com',
    username: 'elena_v',
    fullName: 'Елена Волкова',
    registeredAt: '2024-04-05T12:30:00.000Z',
    lastLoginAt: '2026-01-10T08:00:00.000Z',
    isActive: true,
    notesCount: 31,
  },
];

/**
 * Создает нового мокового пользователя
 */
export function createMockUser(data: Partial<User>): User {
  const now = new Date().toISOString();
  return {
    id: String(MOCK_USERS.length + 1),
    email: data.email || 'user@example.com',
    username: data.username || 'user',
    fullName: data.fullName || 'User Name',
    registeredAt: now,
    lastLoginAt: now,
    isActive: data.isActive ?? true,
    notesCount: 0,
  };
}

