import type { User } from '@/types';

/**
 * Моковые данные пользователей
 */
export const MOCK_USERS: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440201',
    email: 'ivan.petrov@example.com',
    username: 'ivan_petrov',
    full_name: 'Иван Петров',
    registered_at: '2024-01-10T08:30:00Z',
    last_login_at: '2026-01-09T15:20:00Z',
    is_active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440202',
    email: 'maria.smirnova@example.com',
    username: 'maria_s',
    full_name: 'Мария Смирнова',
    registered_at: '2024-02-15T10:00:00Z',
    last_login_at: '2026-01-08T11:45:00Z',
    is_active: true,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440203',
    email: 'alex.ivanov@example.com',
    username: 'alex_iv',
    full_name: 'Александр Иванов',
    registered_at: '2024-03-20T14:15:00Z',
    last_login_at: '2025-12-25T09:10:00Z',
    is_active: false,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440204',
    email: 'elena.volkova@example.com',
    username: 'elena_v',
    full_name: 'Елена Волкова',
    registered_at: '2024-04-05T12:30:00Z',
    last_login_at: '2026-01-10T08:00:00Z',
    is_active: true,
  },
];

/**
 * Создает нового мокового пользователя
 */
export function createMockUser(data: Partial<User>): User {
  const now = new Date().toISOString();
  return {
    id: `550e8400-e29b-41d4-a716-4466554402${String(MOCK_USERS.length + 1).padStart(2, '0')}`,
    email: data.email || 'user@example.com',
    username: data.username || 'user',
    full_name: data.full_name || 'User Name',
    registered_at: now,
    last_login_at: now,
    is_active: data.is_active ?? true,
    role: data.role,
  };
}

