/**
 * Типы для заявок на регистрацию
 */

import type { CreateAdminRequest } from '@/types/auth';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// Используем CreateAdminRequest вместо собственного типа для совместимости
export type RegistrationRequest = CreateAdminRequest;

/**
 * Моковые данные заявок на регистрацию
 */
export const MOCK_REGISTRATION_REQUESTS: RegistrationRequest[] = [
  {
    id: '1',
    email: 'new.user1@example.com',
    username: 'new_user1',
    status: RequestStatus.PENDING,
    metadata: {
      fullName: 'Дмитрий Соколов',
      reason: 'Аспирант МГУ, изучаю философию науки'
    },
    created_at: '2026-01-09T10:30:00.000Z',
    updated_at: '2026-01-09T10:30:00.000Z',
  },
  {
    id: '2',
    email: 'researcher@university.edu',
    username: 'researcher_42',
    status: RequestStatus.PENDING,
    metadata: {
      fullName: 'Анна Козлова',
      reason: 'Научный сотрудник института философии, исследую феноменологию'
    },
    created_at: '2026-01-08T14:20:00.000Z',
    updated_at: '2026-01-08T14:20:00.000Z',
  },
  {
    id: '3',
    email: 'student@philosophy.edu',
    username: 'phil_student',
    status: RequestStatus.APPROVED,
    metadata: {
      fullName: 'Петр Морозов',
      reason: 'Студент 4 курса философского факультета'
    },
    created_at: '2026-01-05T09:15:00.000Z',
    updated_at: '2026-01-06T11:30:00.000Z',
    approved_at: '2026-01-06T11:30:00.000Z',
    approved_by: '1',
  },
  {
    id: '4',
    email: 'random@mail.com',
    username: 'random123',
    status: RequestStatus.REJECTED,
    metadata: {
      fullName: 'Test User',
      rejection_reason: 'Недостаточно информации для проверки'
    },
    created_at: '2026-01-04T16:45:00.000Z',
    updated_at: '2026-01-04T18:00:00.000Z',
    approved_at: '2026-01-04T18:00:00.000Z',
    approved_by: '1',
  },
];

/**
 * Создает новую моковую заявку
 */
export function createMockRegistrationRequest(
  data: Partial<RegistrationRequest>
): RegistrationRequest {
  const now = new Date().toISOString();
  return {
    id: String(MOCK_REGISTRATION_REQUESTS.length + 1),
    email: data.email || 'user@example.com',
    username: data.username || 'user',
    status: data.status || RequestStatus.PENDING,
    metadata: data.metadata,
    created_at: data.created_at || now,
    updated_at: data.updated_at || now,
    approved_by: data.approved_by,
    approved_at: data.approved_at,
  };
}

